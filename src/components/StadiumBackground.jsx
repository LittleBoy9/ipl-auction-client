import StadiumScene from './StadiumScene';

export default function StadiumBackground({ sport = 'cricket' }) {
  const isFootball = sport === 'football';
  return (
    <div className={`stadium-bg ${isFootball ? 'stadium-football' : 'stadium-cricket'}`}>
      {/* Night sky with twinkling stars */}
      <div className="stadium-sky">
        {[...Array(40)].map((_, i) => (
          <div key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 45}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`
          }} />
        ))}
      </div>

      {/* Full top-down stadium illustration (swaps with sport) */}
      <div className="stadium-scene">
        <StadiumScene sport={sport} />
      </div>
    </div>
  );
}
