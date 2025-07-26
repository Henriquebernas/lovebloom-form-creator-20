import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  useEffect(() => {
    // Set current year in footer
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear().toString();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <Link to="/" className="text-3xl playfair-display font-bold text-primary">
            Love<span className="text-secondary">Bloom</span>
          </Link>
          <div>
            <Link to="/criar-site" className="btn-primary text-sm px-6 py-2 rounded-lg font-semibold hover:scale-105 transition-transform">
              Quero fazer meu site
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 relative bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Text Content */}
            <div className="lg:w-1/2 xl:w-3/5 text-center lg:text-left">
              <h1 className="text-5xl sm:text-6xl md:text-7xl playfair-display font-extrabold text-primary mb-6 animate-fade-in">
                Surpreenda <span className="text-secondary">seu amor</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 animate-fade-in">
                Crie um contador dinâmico do tempo de relacionamento. Compartilhe com o seu amor e faça um presente surpresa inesquecível.
              </p>
              <Link 
                to="/criar-site" 
                className="btn-primary text-lg px-8 py-4 rounded-lg font-semibold hover:scale-105 transition-transform inline-block animate-fade-in"
              >
                Quero fazer meu site
              </Link>
            </div>

            {/* Visual Content */}
            <div className="lg:w-1/2 xl:w-2/5 mt-10 lg:mt-0 animate-fade-in">
              <div className="relative min-h-[350px]">
                {/* Laptop Mockup */}
                <div className="relative w-full max-w-[450px] bg-card/50 rounded-2xl p-4 shadow-2xl border border-border/50">
                  <div className="bg-card/80 h-64 rounded-lg overflow-hidden flex items-center justify-center text-muted-foreground text-sm relative">
                    <div className="w-2/3 text-center opacity-70">
                      <span className="absolute top-6 right-12 text-secondary text-lg">❤</span>
                      <h3 className="font-bold mb-2">I have loved you for</h3>
                      <p>2 years, 4 months, 22 days...</p>
                      <span className="absolute bottom-6 left-12 text-secondary text-lg">💕</span>
                    </div>
                  </div>
                </div>

                {/* Phone Mockup */}
                <div className="absolute bottom-[-2rem] left-[-1rem] w-40 h-80 bg-card/50 rounded-3xl p-3 shadow-2xl border-2 border-border/50 z-10">
                  <div className="bg-card/80 h-full rounded-2xl overflow-hidden p-4 text-xs text-muted-foreground">
                    <div className="w-full h-24 bg-muted rounded-md mb-3 opacity-70 flex items-center justify-center">
                      Foto
                    </div>
                    <h4 className="font-bold mb-1">I have loved you for</h4>
                    <p className="text-xs opacity-80">2 years, 4 months, 22 days, 10 hours and 21 seconds</p>
                  </div>
                </div>
              </div>

              {/* Avatars */}
              <div className="flex items-center justify-center lg:justify-start mt-16">
                <div className="flex">
                  <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-semibold">A</div>
                  <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-semibold -ml-4">B</div>
                  <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-semibold -ml-4">C</div>
                  <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-semibold -ml-4">D</div>
                </div>
                <p className="ml-4 text-muted-foreground text-sm">+45.000 memórias eternizadas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-primary mb-4 playfair-display">
            Como <span className="text-secondary">Funciona?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Em apenas quatro passos simples você cria uma surpresa incrível.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-card p-8 rounded-xl border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3 playfair-display">Preencha os Dados</h3>
              <p className="text-muted-foreground">Informe os nomes, data de início, adicione fotos e uma mensagem especial.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-card p-8 rounded-xl border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20m5-5l-5 5-5-5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3 playfair-display">Pague</h3>
              <p className="text-muted-foreground">Escolha seu plano e faça o pagamento de forma segura e rápida.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-card p-8 rounded-xl border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3 playfair-display">Compartilhe</h3>
              <p className="text-muted-foreground">Envie o link exclusivo ou o QR Code para seu amor de forma fácil e rápida.</p>
            </div>

            {/* Step 4 */}
            <div className="bg-card p-8 rounded-xl border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3 playfair-display">Surpreenda</h3>
              <p className="text-muted-foreground">Veja a alegria ao descobrir um presente personalizado e cheio de significado.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-card">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left side - Title and description */}
            <div>
              <h2 className="text-4xl font-bold text-primary mb-6 playfair-display">
                Perguntas <span className="text-secondary">Frequentes</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Aqui você encontra respostas claras para qualquer dúvida que possa surgir. Afinal, queremos que sua experiência seja tranquila e emocionante desde o primeiro clique.
              </p>
            </div>

            {/* Right side - FAQ Grid */}
            <div className="grid gap-4">
              {/* FAQ Item 1 */}
              <div className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-semibold text-primary mb-2 list-none">
                    <span>O que é o LoveBloom?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-muted-foreground mt-3">
                    O LoveBloom é uma plataforma que permite a criação de páginas personalizadas para eternizar momentos especiais. Você pode adicionar fotos, mensagens, emojis e até música para criar uma experiência única.
                  </p>
                </details>
              </div>

              {/* FAQ Item 2 */}
              <div className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-semibold text-primary mb-2 list-none">
                    <span>Como posso criar uma página personalizada no LoveBloom?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-muted-foreground mt-3">
                    Para criar sua página, preencha o formulário com os detalhes que deseja incluir, como título, imagens, mensagem especial, emojis e um contador, se desejar. Depois, finalize o pagamento e receba o link para acessar e compartilhar sua página.
                  </p>
                </details>
              </div>

              {/* FAQ Item 3 */}
              <div className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-semibold text-primary mb-2 list-none">
                    <span>O que está incluído na minha página personalizada?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-muted-foreground mt-3">
                    Sua página personalizada pode incluir um título, imagens, mensagens, emojis, um contador e música de fundo. Você pode personalizar todos esses elementos para se adequar à ocasião.
                  </p>
                </details>
              </div>

              {/* FAQ Item 4 */}
              <div className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-semibold text-primary mb-2 list-none">
                    <span>Como recebo minha página personalizada após o pagamento?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-muted-foreground mt-3">
                    Após a confirmação do pagamento, você receberá um link por e-mail para acessar sua página personalizada e um QR Code para compartilhar.
                  </p>
                </details>
              </div>

              {/* FAQ Item 5 */}
              <div className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-semibold text-primary mb-2 list-none">
                    <span>A página personalizada tem validade?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-muted-foreground mt-3">
                    A validade da sua página pode variar conforme o plano escolhido. Verifique os detalhes do plano no momento da compra.
                  </p>
                </details>
              </div>

              {/* FAQ Item 6 */}
              <div className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-semibold text-primary mb-2 list-none">
                    <span>Qual é o custo para criar uma página no LoveBloom?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-muted-foreground mt-3">
                    Os preços podem variar dependendo do plano e dos recursos adicionais que você escolher. Consulte a página de preços para obter mais informações.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border text-muted-foreground py-12 text-center">
        <div className="container mx-auto px-6">
          <Link to="/" className="text-2xl playfair-display font-bold text-primary mb-4 inline-block">
            Love<span className="text-secondary">Bloom</span>
          </Link>
          <div className="flex justify-center space-x-6 mb-6">
            <a href="#" className="hover:text-secondary transition-colors">Sobre</a>
            <a href="#" className="hover:text-secondary transition-colors">Contato</a>
            <a href="#" className="hover:text-secondary transition-colors">Termos</a>
            <a href="#" className="hover:text-secondary transition-colors">Privacidade</a>
          </div>
          <div className="flex justify-center space-x-6 mb-6">
            <a href="#" className="hover:text-secondary transition-colors">[Instagram]</a>
            <a href="#" className="hover:text-secondary transition-colors">[TikTok]</a>
            <a href="#" className="hover:text-secondary transition-colors">[Facebook]</a>
          </div>
          <p className="text-xs">
            &copy; <span id="currentYear"></span> LoveBloom. Todos os direitos reservados. Feito com <span className="text-secondary">❤</span>.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;