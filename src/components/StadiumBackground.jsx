export default function StadiumBackground() {
  return (
    <div className="stadium-bg">
      {/* Night sky with stars */}
      <div className="stadium-sky">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 40}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`
          }} />
        ))}
      </div>

      {/* Stadium floodlight towers */}
      <div className="floodlight-tower tower-left">
        <div className="tower-pole" />
        <div className="tower-head">
          <div className="light-row">
            <div className="light-bulb" /><div className="light-bulb" /><div className="light-bulb" />
            <div className="light-bulb" /><div className="light-bulb" /><div className="light-bulb" />
          </div>
          <div className="light-row">
            <div className="light-bulb" /><div className="light-bulb" /><div className="light-bulb" />
            <div className="light-bulb" /><div className="light-bulb" /><div className="light-bulb" />
          </div>
        </div>
        <div className="light-beam" />
      </div>

      <div className="floodlight-tower tower-right">
        <div className="tower-pole" />
        <div className="tower-head">
          <div className="light-row">
            <div className="light-bulb" /><div className="light-bulb" /><div className="light-bulb" />
            <div className="light-bulb" /><div className="light-bulb" /><div className="light-bulb" />
          </div>
          <div className="light-row">
            <div className="light-bulb" /><div className="light-bulb" /><div className="light-bulb" />
            <div className="light-bulb" /><div className="light-bulb" /><div className="light-bulb" />
          </div>
        </div>
        <div className="light-beam" />
      </div>

      {/* Stadium stands / crowd */}
      <div className="stadium-stands">
        <div className="crowd-section crowd-left" />
        <div className="crowd-section crowd-center" />
        <div className="crowd-section crowd-right" />
      </div>

      {/* Crowd noise particles */}
      <div className="crowd-noise">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="noise-particle" style={{
            left: `${5 + Math.random() * 90}%`,
            bottom: `${15 + Math.random() * 25}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }} />
        ))}
      </div>

      {/* Cricket pitch */}
      <div className="cricket-pitch">
        <div className="pitch-strip" />
        <div className="pitch-stumps stumps-left">
          <div className="stump" /><div className="stump" /><div className="stump" />
        </div>
        <div className="pitch-stumps stumps-right">
          <div className="stump" /><div className="stump" /><div className="stump" />
        </div>
      </div>

      {/* Field */}
      <div className="cricket-field">
        <div className="field-inner" />
      </div>

      {/* Ball animations */}
      <div className="stadium-ball ball-swing">
        <div className="ball-trail" />
      </div>
    </div>
  );
}
