
export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Regular expression to match various YouTube URL formats
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  
  return match ? match[1] : null;
};

export const createYouTubeEmbedUrl = (videoId: string, startMuted: boolean = false): string => {
  const muteParam = startMuted ? '&mute=1' : '';
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1${muteParam}&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&origin=${window.location.origin}`;
};

// YouTube Player API types
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export const loadYouTubeAPI = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    }
  });
};
