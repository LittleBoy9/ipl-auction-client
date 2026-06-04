// Perspective "stadium bowl" illustration used as the lobby background.
// Looks into the ground from one end: tiered stands + crowd curve around the
// back, floodlight towers beam down onto a green field in front.
// Cricket → oval field, boundary rope, central pitch + stumps.
// Football → pitch markings (centre circle, halfway, penalty boxes, goals).

const CX = 720;
const CY = 815;

// Crowd specks scattered across the upper/side arc of the stands.
const CROWD = [];
for (let layer = 0; layer < 5; layer++) {
  const rx = 905 + layer * 46;
  const ry = 372 + layer * 30;
  for (let t = 0; t < 64; t++) {
    const ang = Math.PI * (1.06 + (0.88 * t) / 63); // ~191°..350°
    CROWD.push([
      CX + rx * Math.cos(ang),
      CY + ry * Math.sin(ang),
      (t + layer) % 3, // hue bucket
    ]);
  }
}
const CROWD_HUES = ['#7d88b5', '#b56d7a', '#6fae8e'];

function FloodTower({ x, y }) {
  return (
    <g>
      {/* glow */}
      <ellipse className="fl-glow" cx={x} cy={y - 6} rx="60" ry="44" fill="url(#flGlow)" />
      {/* beam onto field */}
      <path className="fl-beam" d={`M ${x - 18} ${y} L ${x + 18} ${y} L ${CX + 120} ${CY - 40} L ${CX - 120} ${CY - 40} Z`} fill="url(#beamGrad)" opacity="0.18" />
      {/* pole */}
      <rect x={x - 3} y={y} width="6" height="120" fill="#1d2540" />
      {/* head */}
      <rect x={x - 30} y={y - 22} width="60" height="30" rx="5" fill="#252e4c" stroke="#46527e" strokeWidth="1.5" />
      {[0, 1].map(r => [0, 1, 2, 3].map(c => (
        <circle key={`${r}-${c}`} cx={x - 21 + c * 14} cy={y - 13 + r * 13} r="3" fill="#fdf3b8" opacity="0.95" />
      )))}
    </g>
  );
}

function CricketGround() {
  const cy = 720; // raised + enlarged so more of the ground shows past the card
  return (
    <g>
      {/* concourse ring + oval outfield */}
      <ellipse cx={CX} cy={cy} rx="1030" ry="412" fill="#0b1120" />
      <ellipse cx={CX} cy={cy} rx="990" ry="388" fill="url(#fieldGrad)" />
      {/* boundary rope */}
      <ellipse cx={CX} cy={cy} rx="942" ry="368" fill="none" stroke="#eaf3ff" strokeWidth="3.5" opacity="0.8" strokeDasharray="2 18" strokeLinecap="round" />
      {/* 30-yard circle */}
      <ellipse cx={CX} cy={cy - 38} rx="436" ry="166" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.38" strokeDasharray="9 13" />
      {/* mowing arc */}
      <ellipse cx={CX} cy={cy - 14} rx="722" ry="280" fill="none" stroke="#ffffff" strokeWidth="40" opacity="0.03" />
      {/* pitch (perspective trapezoid: wider/closer at bottom) */}
      <polygon points="680,556 760,556 792,952 648,952" fill="#c2a366" opacity="0.92" />
      <polygon points="680,556 760,556 792,952 648,952" fill="none" stroke="#9c7d44" strokeWidth="1.5" opacity="0.5" />
      <line x1="682" y1="600" x2="758" y2="600" stroke="#fff" strokeWidth="2" opacity="0.6" />
      <line x1="660" y1="908" x2="780" y2="908" stroke="#fff" strokeWidth="2.5" opacity="0.65" />
      {/* stumps (far end) */}
      <g stroke="#eaeaea" strokeWidth="2.5">
        <line x1="711" y1="568" x2="711" y2="584" />
        <line x1="720" y1="568" x2="720" y2="584" />
        <line x1="729" y1="568" x2="729" y2="584" />
      </g>
    </g>
  );
}

function FootballGround() {
  // Rectangular pitch in perspective → a trapezoid (wider/closer at bottom).
  // Raised + enlarged so more of the pitch shows around the card.
  const pitch = '360,460 1080,460 1280,1140 160,1140';
  return (
    <g>
      {/* dark surround + green rectangular pitch */}
      <polygon points="324,438 1116,438 1340,1165 100,1165" fill="#0b1120" />
      <polygon points={pitch} fill="url(#fieldGrad)" />
      {/* mow stripes, clipped to the pitch */}
      <clipPath id="fbPitch"><polygon points={pitch} /></clipPath>
      <g clipPath="url(#fbPitch)">
        {[220, 620, 1020].map((x, i) => (
          <rect key={i} x={x} y="450" width="220" height="720" fill="#ffffff" opacity="0.04" />
        ))}
      </g>
      {/* markings */}
      <g fill="none" stroke="#eaf3ff" strokeWidth="3" opacity="0.78" strokeLinejoin="round">
        {/* boundary */}
        <polygon points="375,464 1065,464 1256,1128 184,1128" />
        {/* halfway line */}
        <line x1="280" y1="796" x2="1160" y2="796" />
        {/* centre circle + spot (circle reads as an ellipse in perspective) */}
        <ellipse cx={CX} cy="796" rx="175" ry="53" />
        <circle cx={CX} cy="796" r="4" fill="#eaf3ff" stroke="none" />
        {/* far goal: penalty box + 6-yard box + goal */}
        <polygon points="535,464 905,464 921,568 519,568" />
        <polygon points="615,464 825,464 838,522 602,522" />
        <polygon points="685,464 755,464 750,448 690,448" />
        {/* near goal: penalty box + 6-yard box + goal */}
        <polygon points="478,1128 962,1128 948,1022 492,1022" />
        <polygon points="585,1128 855,1128 844,1072 596,1072" />
        <polygon points="690,1128 750,1128 755,1144 685,1144" />
      </g>
    </g>
  );
}

export default function StadiumScene({ sport = 'cricket' }) {
  const isFootball = sport === 'football';
  const flood = [
    [255, 250], [1185, 250], [95, 470], [1345, 470],
  ];
  return (
    <svg
      className="stadium-scene-svg"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="fieldGrad" cx="50%" cy="38%" r="70%">
          <stop offset="0%" stopColor={isFootball ? '#2a7a36' : '#2a7a32'} />
          <stop offset="60%" stopColor={isFootball ? '#1c5826' : '#1a4d22'} />
          <stop offset="100%" stopColor="#0f3115" />
        </radialGradient>
        <linearGradient id="standGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#222b48" />
          <stop offset="100%" stopColor="#0c1222" />
        </linearGradient>
        <radialGradient id="flGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff4c2" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fff4c2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beamGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff4c2" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff4c2" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Stands bowl */}
      <ellipse cx={CX} cy={CY} rx="1300" ry="520" fill="url(#standGrad)" />
      <ellipse cx={CX} cy={CY} rx="1140" ry="452" fill="none" stroke="#2c3656" strokeWidth="2" opacity="0.6" />
      <ellipse cx={CX} cy={CY} rx="1035" ry="406" fill="none" stroke="#2c3656" strokeWidth="2" opacity="0.45" />

      {/* Crowd */}
      <g className="crowd-twinkle">
        {CROWD.map(([x, y, h], i) => (
          <circle key={i} cx={x} cy={y} r="2.6" fill={CROWD_HUES[h]} opacity="0.55" />
        ))}
      </g>

      {/* Playing surface — oval ground (cricket) or rectangular pitch (football) */}
      {isFootball ? <FootballGround /> : <CricketGround />}

      {/* Floodlights on top */}
      {flood.map(([x, y], i) => <FloodTower key={i} x={x} y={y} />)}
    </svg>
  );
}
