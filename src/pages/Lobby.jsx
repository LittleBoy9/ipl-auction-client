import { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import StadiumBackground from '../components/StadiumBackground';
import { SPORTS, getSport } from '../data/sports';

// Renders one franchise: real crest from team.logo if it loads, otherwise a
// coloured monogram badge. Drop a file at /teams/<code>.svg to use a real logo.
function FranchiseChip({ team, selected, onClick }) {
  const [showLogo, setShowLogo] = useState(!!team.logo);
  return (
    <div
      className={`franchise-chip ${selected ? 'selected' : ''}`}
      onClick={onClick}
      style={{ '--team-color': team.color }}
    >
      {showLogo ? (
        <img src={team.logo} alt={team.name} onError={() => setShowLogo(false)} />
      ) : (
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%',
          background: team.color, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.5px'
        }}>{team.code}</div>
      )}
      <span>{team.code}</span>
    </div>
  );
}

export default function Lobby({ sport, onSportChange, onRoomCreated, onRoomJoined }) {
  const { socket, connected } = useSocket();
  const [mode, setMode] = useState('home'); // home, create, join
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [budget, setBudget] = useState(100);
  const [squadSize, setSquadSize] = useState(11);
  const [bidTimer, setBidTimer] = useState(15);
  const [maxPlayers, setMaxPlayers] = useState(250);
  const [botCount, setBotCount] = useState(0);
  const [myFranchise, setMyFranchise] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sportCfg = getSport(sport);

  // Switching sport resets sport-specific picks (franchises + budget differ).
  const chooseSport = (id) => {
    onSportChange(id);
    setMyFranchise('');
    setBudget(getSport(id).defaultBudget);
  };

  const handleCreateRoom = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!myFranchise) {
      setError('Please select your franchise');
      return;
    }
    if (!connected) {
      setError('Not connected to server. Please wait...');
      return;
    }
    setLoading(true);
    setError('');

    socket.emit('create-room', {
      hostName: name.trim(),
      settings: {
        sport,
        budget,
        squadSize,
        bidTimer,
        franchise: myFranchise,
        maxPlayers: maxPlayers === 250 ? undefined : maxPlayers,
        botCount,
      }
    });

    socket.once('room-created', (data) => {
      setLoading(false);
      onRoomCreated(data);
    });

    socket.once('error', (data) => {
      setLoading(false);
      setError(data.message);
    });
  };

  const handleJoinRoom = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter room code');
      return;
    }
    if (!myFranchise) {
      setError('Please select your franchise');
      return;
    }
    if (!connected) {
      setError('Not connected to server. Please wait...');
      return;
    }
    setLoading(true);
    setError('');

    socket.emit('join-room', {
      roomCode: roomCode.trim().toUpperCase(),
      playerName: name.trim(),
      franchise: myFranchise
    });

    socket.once('joined-room', (data) => {
      setLoading(false);
      onRoomJoined(data);
    });

    socket.once('error', (data) => {
      setLoading(false);
      setError(data.message);
    });
  };

  if (mode === 'home') {
    return (
      <div className="lobby-container">
        <StadiumBackground sport={sport} />

        <div className="lobby-card lobby-wide">
          {/* About Me Section */}
          <div className="about-me">
            <div className="about-me-photo">
              <img src="/profile.jpeg" alt="Profile" />
            </div>
            <div className="about-me-info">
              <h3>Hey, I'm Sounak! 👋</h3>
              <p>Full-stack developer & sports fanatic. Built this multiplayer Auction Game — pick <strong>Cricket (IPL)</strong> or <strong>Football (EPL &amp; LaLiga)</strong>, then bid, strategize, and build your dream squad with friends!</p>
              <div className="about-me-tags">
                <span>⚛️ React</span>
                <span>⚡ Node.js</span>
                <span>🔌 Socket.io</span>
                <span>🏏 Cricket</span>
                <span>⚽ Football</span>
              </div>
              <div className="about-me-socials">
                <a className="social-linkedin" href="https://www.linkedin.com/in/sounakdas?utm_source=ipl_auction" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
                <a className="social-portfolio" href="https://sounakdas.in?utm_source=ipl_auction" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0zm5.568 8.16c-.169-.015-.339-.022-.51-.022-2.802 0-4.658 1.802-4.658 5.059v6.083h-3.96V6.375h3.805v1.566h.054c.53-.98 1.826-2.015 3.759-2.015.458 0 .9.058 1.326.158l-.816 2.076z"/></svg>
                  Portfolio
                </a>
                <a className="social-instagram" href="https://www.instagram.com/frame.chor?utm_source=ipl_auction" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  Instagram
                </a>
              </div>
            </div>
          </div>

          <div className="home-divider" />

          <h2>{sportCfg.icon} {sport === 'cricket' ? 'IPL Auction' : 'Football Auction'}</h2>
          <p>{sport === 'cricket'
            ? 'Create a room and bid on real IPL players with your friends!'
            : 'Create a room and bid on football stars from the EPL & LaLiga with your friends!'}</p>
          
          <div className="input-group">
            <label>Your Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="input-group">
            <label>Choose Sport</label>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {Object.values(SPORTS).map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => chooseSport(s.id)}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    borderRadius: '12px',
                    border: sport === s.id ? '2px solid #e94560' : '1.5px solid rgba(255,255,255,0.12)',
                    background: sport === s.id ? 'rgba(233,69,96,0.15)' : 'rgba(255,255,255,0.04)',
                    color: '#fff',
                    fontWeight: sport === s.id ? 700 : 500,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  {s.icon} {s.id === 'cricket' ? 'Cricket' : 'Football'}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.4rem' }}>
              {sportCfg.label}
            </p>
          </div>

          <button className="btn btn-primary" onClick={() => setMode('create')} disabled={!name.trim()}>
            🎮 Create Room
          </button>

          <div className="divider">OR</div>

          <button className="btn btn-secondary" onClick={() => setMode('join')} disabled={!name.trim()}>
            🔗 Join Room
          </button>

          {!connected && (
            <p style={{ color: '#ff6b6b', marginTop: '1rem', fontSize: '0.9rem' }}>
              ⚠️ Connecting to server...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="lobby-container">
        <StadiumBackground sport={sport} />
        <div className="lobby-card lobby-wide">
          <h2>⚙️ Room Settings</h2>
          <p>Configure your auction</p>

          {error && <div className="notification error" style={{ position: 'relative', marginBottom: '1rem' }}>{error}</div>}

          <div className="settings-panel">
            <h4>💰 Budget & Squad</h4>
            <div className="settings-row">
              <div className="input-group">
                <label>Budget</label>
                <select value={budget} onChange={(e) => setBudget(Number(e.target.value))}>
                  {sportCfg.budgetOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Squad Size</label>
                <select value={squadSize} onChange={(e) => setSquadSize(Number(e.target.value))}>
                  <option value={7}>7 Players</option>
                  <option value={9}>9 Players</option>
                  <option value={11}>11 Players</option>
                  <option value={13}>13 Players</option>
                  <option value={15}>15 Players</option>
                </select>
              </div>
            </div>
            <div className="settings-row">
              <div className="input-group">
                <label>Bid Timer</label>
                <select value={bidTimer} onChange={(e) => setBidTimer(Number(e.target.value))}>
                  <option value={5}>5 sec (Blitz!)</option>
                  <option value={10}>10 sec</option>
                  <option value={15}>15 sec</option>
                  <option value={20}>20 sec</option>
                  <option value={30}>30 sec</option>
                </select>
              </div>
              <div className="input-group">
                <label>Max Players in Pool</label>
                <select value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))}>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={150}>150</option>
                  <option value={250}>All</option>
                </select>
              </div>
              <div className="input-group">
                <label>🤖 AI Bots</label>
                <select value={botCount} onChange={(e) => setBotCount(Number(e.target.value))}>
                  <option value={0}>No Bots</option>
                  <option value={1}>1 Bot</option>
                  <option value={2}>2 Bots</option>
                  <option value={3}>3 Bots</option>
                  <option value={4}>4 Bots</option>
                  <option value={5}>5 Bots</option>
                  <option value={6}>6 Bots</option>
                  <option value={7}>7 Bots</option>
                  <option value={8}>8 Bots</option>
                  <option value={9}>9 Bots</option>
                </select>
              </div>
            </div>

            <h4 style={{ marginTop: '1.5rem' }}>{sportCfg.icon} Pick Your Franchise</h4>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.8rem' }}>
              Choose which {sport === 'cricket' ? 'IPL team' : 'club'} you want to represent
            </p>
            <div className="franchise-picker">
              {sportCfg.franchises.map(team => (
                <FranchiseChip
                  key={team.code}
                  team={team}
                  selected={myFranchise === team.code}
                  onClick={() => setMyFranchise(team.code)}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button className="btn btn-primary" onClick={handleCreateRoom} disabled={loading} style={{ flex: 1, maxWidth: '280px' }}>
              {loading ? 'Creating...' : '🚀 Create Room'}
            </button>
            <button className="btn btn-secondary" onClick={() => setMode('home')} style={{ flex: 1, maxWidth: '200px' }}>
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="lobby-container">
        <StadiumBackground sport={sport} />
        <div className="lobby-card">
          <h2>🔗 Join Room</h2>
          <p>Enter the room code and pick your franchise</p>

          {error && <div className="notification error" style={{ position: 'relative', marginBottom: '1rem' }}>{error}</div>}

          <div className="input-group">
            <label>Room Code</label>
            <input
              type="text"
              placeholder="e.g. IPL-ABCD"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={10}
            />
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', textAlign: 'left' }}>
              {sportCfg.icon} Pick Your Franchise <span style={{ opacity: 0.5, fontWeight: 400 }}>({sport === 'cricket' ? 'Cricket' : 'Football'})</span>
            </label>
            <div className="franchise-picker">
              {sportCfg.franchises.map(team => (
                <FranchiseChip
                  key={team.code}
                  team={team}
                  selected={myFranchise === team.code}
                  onClick={() => setMyFranchise(team.code)}
                />
              ))}
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleJoinRoom} disabled={loading}>
            {loading ? 'Joining...' : '🎮 Join Auction'}
          </button>
          <button className="btn btn-secondary" onClick={() => setMode('home')}>
            ← Back
          </button>
        </div>
      </div>
    );
  }
}
