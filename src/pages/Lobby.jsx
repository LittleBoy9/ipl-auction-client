import { useState } from 'react';
import { useSocket } from '../context/SocketContext';

const TEAMS = [
  { code: 'CSK', name: 'Chennai Super Kings', color: '#f4c430', logo: '/teams/csk.svg' },
  { code: 'MI', name: 'Mumbai Indians', color: '#004ba0', logo: '/teams/mi.svg' },
  { code: 'RCB', name: 'Royal Challengers', color: '#ec1c24', logo: '/teams/rcb.svg' },
  { code: 'KKR', name: 'Kolkata Knight Riders', color: '#3a225d', logo: '/teams/kkr.svg' },
  { code: 'SRH', name: 'Sunrisers Hyderabad', color: '#f26522', logo: '/teams/srh.svg' },
  { code: 'DC', name: 'Delhi Capitals', color: '#0078bc', logo: '/teams/dc.svg' },
  { code: 'PBKS', name: 'Punjab Kings', color: '#d71920', logo: '/teams/pbks.svg' },
  { code: 'RR', name: 'Rajasthan Royals', color: '#254aa5', logo: '/teams/rr.svg' },
  { code: 'LSG', name: 'Lucknow Super Giants', color: '#a5d8f0', logo: '/teams/lsg.svg' },
  { code: 'GT', name: 'Gujarat Titans', color: '#1b2133', logo: '/teams/gt.svg' },
];

export default function Lobby({ onRoomCreated, onRoomJoined }) {
  const { socket, connected } = useSocket();
  const [mode, setMode] = useState('home'); // home, create, join
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [budget, setBudget] = useState(100);
  const [squadSize, setSquadSize] = useState(11);
  const [bidTimer, setBidTimer] = useState(15);
  const [maxPlayers, setMaxPlayers] = useState(250);
  const [botCount, setBotCount] = useState(0);
  const [selectedTeams, setSelectedTeams] = useState(TEAMS.map(t => t.code));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleTeam = (code) => {
    if (selectedTeams.includes(code)) {
      if (selectedTeams.length > 1) {
        setSelectedTeams(selectedTeams.filter(t => t !== code));
      }
    } else {
      setSelectedTeams([...selectedTeams, code]);
    }
  };

  const handleCreateRoom = () => {
    if (!name.trim()) {
      setError('Please enter your name');
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
        budget,
        squadSize,
        bidTimer,
        teams: selectedTeams,
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
    if (!connected) {
      setError('Not connected to server. Please wait...');
      return;
    }
    setLoading(true);
    setError('');

    socket.emit('join-room', {
      roomCode: roomCode.trim().toUpperCase(),
      playerName: name.trim()
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
        <div className="lobby-card lobby-wide">
          {/* About Me Section */}
          <div className="about-me">
            <div className="about-me-photo">
              <img src="/profile.jpeg" alt="Profile" />
            </div>
            <div className="about-me-info">
              <h3>Hey, I'm Sounak! 👋</h3>
              <p>Full-stack developer & cricket fanatic. Built this IPL 2026 Auction Game so friends can bid, strategize, and build dream squads together — just like the real IPL auction!</p>
              <div className="about-me-tags">
                <span>⚛️ React</span>
                <span>⚡ Node.js</span>
                <span>🔌 Socket.io</span>
                <span>🏏 IPL 2026</span>
              </div>
              <div className="about-me-socials">
                <a href="https://www.linkedin.com/in/sounakdas?utm_source=ipl_auction" target="_blank" rel="noopener noreferrer">💼 LinkedIn</a>
                <a href="https://sounakdas.in?utm_source=ipl_auction" target="_blank" rel="noopener noreferrer">🌐 Portfolio</a>
                <a href="https://www.instagram.com/frame.chor?utm_source=ipl_auction" target="_blank" rel="noopener noreferrer">📸 Instagram</a>
              </div>
            </div>
          </div>

          <div className="home-divider" />

          <h2>🏏 IPL 2026 Auction</h2>
          <p>Create a room and bid on real IPL 2026 players with your friends!</p>
          
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
        <div className="lobby-card lobby-wide">
          <h2>⚙️ Room Settings</h2>
          <p>Configure your auction</p>

          {error && <div className="notification error" style={{ position: 'relative', marginBottom: '1rem' }}>{error}</div>}

          <div className="settings-two-col">
            {/* LEFT — Settings */}
            <div className="settings-left">
              <h4>💰 Budget & Squad</h4>
              <div className="settings-row">
                <div className="input-group">
                  <label>Budget (₹ Cr)</label>
                  <select value={budget} onChange={(e) => setBudget(Number(e.target.value))}>
                    <option value={50}>₹50 Cr</option>
                    <option value={75}>₹75 Cr</option>
                    <option value={100}>₹100 Cr</option>
                    <option value={120}>₹120 Cr</option>
                    <option value={150}>₹150 Cr</option>
                    <option value={200}>₹200 Cr</option>
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
                  <label>Max Players</label>
                  <select value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))}>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={150}>150</option>
                    <option value={200}>200</option>
                    <option value={250}>All (250+)</option>
                    <option value={300}>300</option>
                    <option value={400}>400</option>
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
            </div>

            {/* RIGHT — Teams */}
            <div className="settings-right">
              <h4>🏟️ Select Teams</h4>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.8rem', textAlign: 'left' }}>
                Click to toggle teams for the auction pool
              </p>
              <div className="team-selector">
                {TEAMS.map((team, idx) => (
                  <div
                    key={team.code}
                    className={`team-card ${selectedTeams.includes(team.code) ? 'selected' : ''}`}
                    onClick={() => toggleTeam(team.code)}
                    style={{ 
                      animationDelay: `${idx * 0.04}s`,
                      '--team-color': team.color,
                    }}
                    title={team.name}
                  >
                    <img src={team.logo} alt={team.name} className="team-card-logo" />
                    <span className="team-card-name">{team.name}</span>
                    {selectedTeams.includes(team.code) && (
                      <div className="team-check">✓</div>
                    )}
                  </div>
                ))}
              </div>
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
        <div className="lobby-card">
          <h2>🔗 Join Room</h2>
          <p>Enter the room code from your host</p>

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
