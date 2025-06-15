
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details, null, 2)}` : '';
  console.log(`[${timestamp}] [STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

const generateUrlSlug = (coupleName: string): string => {
  const generateHash = () => {
    return Math.random().toString(36).substring(2, 7);
  };

  const nameSlug = coupleName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '_') // Substitui espaços por underscores
    .replace(/_+/g, '_') // Remove underscores duplicados
    .replace(/^_+|_+$/g, '') || 'casal'; // Remove underscores no início/fim

  const hash = generateHash();
  return `${nameSlug}_${hash}`;
};

const uploadPhotoFromBase64 = async (base64Data: string, coupleId: string, order: number, supabaseClient: any) => {
  try {
    logStep(`Starting photo upload ${order}`, { coupleId });
    
    // Extrair dados da string base64
    const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid base64 format');
    }

    const mimeType = matches[1];
    const base64Content = matches[2];
    
    // Converter base64 para Uint8Array
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Determinar extensão do arquivo
    const extension = mimeType.includes('jpeg') ? 'jpg' : 
                     mimeType.includes('png') ? 'png' : 
                     mimeType.includes('webp') ? 'webp' : 'jpg';

    const fileName = `${coupleId}-${order}-${Date.now()}.${extension}`;
    const filePath = `${coupleId}/${fileName}`;

    logStep(`Uploading photo to storage`, { fileName, mimeType, fileSize: bytes.length });

    // Upload para o storage
    const { error: uploadError } = await supabaseClient.storage
      .from('couple-photos')
      .upload(filePath, bytes, {
        contentType: mimeType,
        upsert: false
      });

    if (uploadError) {
      logStep('Storage upload error', { error: uploadError });
      throw uploadError;
    }

    const { data } = supabaseClient.storage
      .from('couple-photos')
      .getPublicUrl(filePath);

    logStep(`Photo uploaded successfully`, { photoUrl: data.publicUrl });
    return data.publicUrl;
  } catch (err) {
    logStep('Error uploading photo', { error: err.message, order, stack: err.stack });
    // Se falhar o upload, retornar uma URL de placeholder
    return `https://placehold.co/360x640/1a1a2e/ff007f?text=Foto+${order}`;
  }
};

serve(async (req) => {
  logStep("=== WEBHOOK REQUEST RECEIVED ===", {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  if (req.method === 'OPTIONS') {
    logStep("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    logStep("Invalid HTTP method", { method: req.method });
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  // Use service role key for webhook processing (no user authentication needed)
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("CRITICAL ERROR: Stripe secret key not configured");
      throw new Error("Stripe secret key não configurado");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const contentType = req.headers.get('content-type');

    logStep("Webhook data received", { 
      bodyLength: body.length, 
      hasSignature: !!signature,
      contentType: contentType,
      signaturePreview: signature ? signature.substring(0, 20) + '...' : 'none'
    });

    let event;
    try {
      // Para produção, você deve verificar a assinatura do webhook
      event = JSON.parse(body);
      logStep("Event parsed successfully", { 
        type: event.type, 
        id: event.id,
        created: event.created,
        objectId: event.data?.object?.id
      });
    } catch (err) {
      logStep("CRITICAL ERROR: Failed to parse webhook body", { 
        error: err.message,
        bodyPreview: body.substring(0, 200)
      });
      return new Response("Webhook parsing error", { status: 400, headers: corsHeaders });
    }

    // Processar diferentes tipos de eventos
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      logStep("=== PROCESSING CHECKOUT SESSION COMPLETED ===", { 
        sessionId: session.id,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total
      });

      // Buscar o pagamento no banco de dados
      logStep("Searching for payment in database", { sessionId: session.id });
      
      const { data: payment, error: paymentError } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('stripe_session_id', session.id)
        .single();

      if (paymentError) {
        logStep("CRITICAL ERROR: Database query failed", { 
          error: paymentError,
          table: 'payments',
          searchField: 'stripe_session_id',
          searchValue: session.id
        });
        return new Response("Database error", { status: 500, headers: corsHeaders });
      }

      if (!payment) {
        logStep("CRITICAL ERROR: Payment not found in database", { 
          sessionId: session.id,
          searchPerformed: true
        });
        return new Response("Payment not found", { status: 404, headers: corsHeaders });
      }

      logStep("Payment found in database", { 
        paymentId: payment.id, 
        coupleId: payment.couple_id,
        hasFormData: !!payment.form_data,
        currentStatus: payment.status,
        planType: payment.plan_type,
        hasPartner: !!payment.partner_id
      });

      // Se o pagamento foi bem-sucedido e ainda não criamos o casal, criar agora
      if (!payment.couple_id && payment.form_data) {
        logStep("=== CREATING COUPLE AFTER SUCCESSFUL PAYMENT ===");
        
        const formData = payment.form_data;
        logStep("Form data analysis", { 
          coupleName: formData.coupleName,
          email: formData.email,
          startDate: formData.startDate,
          selectedPlan: formData.selectedPlan,
          hasPhotos: !!(formData.photosBase64 && formData.photosBase64.length > 0),
          photoCount: formData.photosBase64?.length || 0,
          hasMusicUrl: !!formData.musicUrl
        });
        
        // Gerar slug único
        let urlSlug = generateUrlSlug(formData.coupleName);
        let counter = 1;

        // Verificar se o slug já existe
        while (counter <= 10) {
          logStep(`Checking slug availability (attempt ${counter})`, { slug: urlSlug });
          
          const { data: existing } = await supabaseClient
            .from('couples')
            .select('id')
            .eq('url_slug', urlSlug)
            .single();

          if (!existing) {
            logStep("Slug is available", { slug: urlSlug });
            break; // Slug disponível
          }

          logStep(`Slug already exists, generating new one`, { attempt: counter, existingSlug: urlSlug });
          urlSlug = generateUrlSlug(formData.coupleName);
          counter++;
        }

        if (counter > 10) {
          logStep("WARNING: Max slug generation attempts reached, using timestamp fallback");
          const timestamp = Date.now().toString().slice(-5);
          const baseSlug = formData.coupleName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '_') || 'casal';
          urlSlug = `${baseSlug}_${timestamp}`;
        }

        logStep("Creating couple with final data", { 
          coupleName: formData.coupleName,
          urlSlug: urlSlug,
          startDate: formData.startDate,
          email: formData.email,
          selectedPlan: formData.selectedPlan
        });

        // Criar o casal
        const { data: couple, error: coupleError } = await supabaseClient
          .from('couples')
          .insert({
            couple_name: formData.coupleName,
            start_date: formData.startDate,
            start_time: formData.startTime || null,
            message: formData.message || null,
            selected_plan: formData.selectedPlan,
            music_url: formData.musicUrl || null,
            email: formData.email,
            url_slug: urlSlug
          })
          .select()
          .single();

        if (coupleError) {
          logStep("CRITICAL ERROR: Failed to create couple", { 
            error: coupleError,
            formData: {
              coupleName: formData.coupleName,
              email: formData.email,
              urlSlug: urlSlug
            }
          });
          return new Response("Failed to create couple", { status: 500, headers: corsHeaders });
        }

        logStep("SUCCESS: Couple created", { 
          coupleId: couple.id, 
          urlSlug: urlSlug,
          coupleName: couple.couple_name
        });

        // Upload das fotos se existirem
        if (formData.photosBase64 && formData.photosBase64.length > 0) {
          logStep("=== STARTING PHOTO UPLOADS ===", { 
            totalPhotos: formData.photosBase64.length,
            coupleId: couple.id
          });
          
          for (let i = 0; i < formData.photosBase64.length; i++) {
            logStep(`Processing photo ${i + 1}/${formData.photosBase64.length}`);
            
            try {
              const photoUrl = await uploadPhotoFromBase64(
                formData.photosBase64[i], 
                couple.id, 
                i + 1, 
                supabaseClient
              );

              // Salvar referência da foto no banco
              logStep(`Saving photo ${i + 1} reference to database`, { photoUrl });
              
              const { error: photoSaveError } = await supabaseClient
                .from('couple_photos')
                .insert({
                  couple_id: couple.id,
                  photo_url: photoUrl,
                  photo_order: i + 1,
                  file_name: `photo_${i + 1}.jpg`,
                  file_size: 0
                });

              if (photoSaveError) {
                logStep(`ERROR: Failed to save photo ${i + 1} to database`, { 
                  error: photoSaveError,
                  photoUrl: photoUrl
                });
              } else {
                logStep(`SUCCESS: Photo ${i + 1} saved to database`);
              }
            } catch (photoError) {
              logStep(`ERROR: Photo ${i + 1} processing failed completely`, { 
                error: photoError.message,
                stack: photoError.stack
              });
            }
          }
          
          logStep("=== PHOTO UPLOADS COMPLETED ===");
        } else {
          logStep("No photos to upload");
        }

        // Atualizar o pagamento com o ID do casal
        logStep("Updating payment with couple information");
        
        const { error: updateError } = await supabaseClient
          .from('payments')
          .update({
            couple_id: couple.id,
            status: 'succeeded',
            stripe_payment_intent_id: session.payment_intent,
            payment_method: session.payment_method_types?.[0] || 'card',
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.id);

        if (updateError) {
          logStep("CRITICAL ERROR: Failed to update payment", { 
            error: updateError,
            paymentId: payment.id,
            coupleId: couple.id
          });
          return new Response("Failed to update payment", { status: 500, headers: corsHeaders });
        }

        // Processar comissão se houver parceiro
        if (payment.partner_id) {
          logStep("=== PROCESSING PARTNER COMMISSION ===", { partnerId: payment.partner_id });
          
          // Buscar dados do parceiro
          const { data: partner, error: partnerError } = await supabaseClient
            .from('partners')
            .select('*')
            .eq('id', payment.partner_id)
            .single();

          if (partnerError) {
            logStep("ERROR: Failed to fetch partner", { error: partnerError, partnerId: payment.partner_id });
          } else {
            const commissionAmount = Math.round(payment.amount * (partner.commission_percentage / 100));
            
            logStep("Creating commission record", {
              partnerId: partner.id,
              paymentId: payment.id,
              commissionAmount: commissionAmount,
              commissionPercentage: partner.commission_percentage
            });

            // Criar registro de comissão
            const { error: commissionError } = await supabaseClient
              .from('commissions')
              .insert({
                partner_id: payment.partner_id,
                payment_id: payment.id,
                commission_amount: commissionAmount,
                commission_percentage: partner.commission_percentage,
                status: 'pending'
              });

            if (commissionError) {
              logStep("ERROR: Failed to create commission", { error: commissionError });
            } else {
              logStep("SUCCESS: Commission record created", { commissionAmount });
            }
          }
        }

        logStep("=== SUCCESS: WEBHOOK PROCESSING COMPLETED ===", { 
          paymentId: payment.id, 
          coupleId: couple.id,
          urlSlug: urlSlug,
          finalStatus: 'succeeded',
          hasCommission: !!payment.partner_id
        });
      } else {
        logStep("SKIPPING COUPLE CREATION", { 
          reason: payment.couple_id ? 'Couple already exists' : 'No form data available',
          coupleId: payment.couple_id,
          hasFormData: !!payment.form_data 
        });
      }
    } else {
      logStep("Unhandled event type received", { 
        type: event.type,
        id: event.id,
        handled: false
      });
    }

    logStep("=== WEBHOOK PROCESSING COMPLETED SUCCESSFULLY ===");
    return new Response("OK", { status: 200, headers: corsHeaders });

  } catch (error) {
    logStep("=== CRITICAL ERROR IN WEBHOOK PROCESSING ===", { 
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
