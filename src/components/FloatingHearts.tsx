
const FloatingHearts = () => {
  return (
    <>
      <span className="floating-heart absolute opacity-0 pointer-events-none text-neon-pink" style={{
        top: '8%', 
        left: '8%', 
        fontSize: '20px',
        animation: 'floatHeart 8s infinite ease-in-out 0s'
      }}>❤</span>
      <span className="floating-heart absolute opacity-0 pointer-events-none text-neon-pink" style={{
        top: '15%', 
        right: '12%', 
        fontSize: '14px',
        animation: 'floatHeart 8s infinite ease-in-out 1s'
      }}>💖</span>
      <span className="floating-heart absolute opacity-0 pointer-events-none text-neon-pink" style={{
        bottom: '25%', 
        left: '5%', 
        fontSize: '18px',
        animation: 'floatHeart 8s infinite ease-in-out 2s'
      }}>💕</span>
      <span className="floating-heart absolute opacity-0 pointer-events-none text-neon-pink" style={{
        bottom: '12%', 
        right: '8%', 
        fontSize: '22px',
        animation: 'floatHeart 8s infinite ease-in-out 3s'
      }}>💗</span>
      <span className="floating-heart absolute opacity-0 pointer-events-none text-neon-pink" style={{
        top: '35%', 
        left: '20%', 
        fontSize: '16px',
        animation: 'floatHeart 8s infinite ease-in-out 1.5s'
      }}>💓</span>
      <span className="floating-heart absolute opacity-0 pointer-events-none text-neon-pink" style={{
        top: '3%', 
        right: '25%', 
        fontSize: '18px',
        animation: 'floatHeart 8s infinite ease-in-out 2.5s'
      }}>💝</span>
    </>
  );
};

export default FloatingHearts;
