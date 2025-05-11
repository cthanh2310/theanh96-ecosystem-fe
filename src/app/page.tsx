import MatchInteraction from '@/components/MatchInteraction';

export default function Home() {
  return (
    <main 
      className="min-h-screen py-8 relative"
      style={{
        backgroundImage: 'url(/image.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/50" /> {/* Overlay for better readability */}
      <div className="relative z-10"> {/* Content wrapper */}
        <MatchInteraction />
      </div>
    </main>
  );
}
