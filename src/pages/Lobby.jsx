import { useState } from 'react';
import { useSocket } from '../context/SocketContext';

const TEAMS = [
  { code: 'CSK', name: 'CSK', color: 'csk' },
  { code: 'MI', name: 'MI', color: 'mi' },
  { code: 'RCB', name: 'RCB', color: 'rcb' },
  { code: 'KKR', name: 'KKR', color: 'kkr' },
  { code: 'SRH', name: 'SRH', color: 'srh' },
  { code: 'DC', name: 'DC', color: 'dc' },
  { code: 'PBKS', name: 'PBKS', color: 'pbks' },
  { code: 'RR', name: 'RR', color: 'rr' },
  { code: 'LSG', name: 'LSG', color: 'lsg' },
  { code: 'GT', name: 'GT', color: 'gt' },
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
        <div className="lobby-card">
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
        <div className="lobby-card">
          <h2>⚙️ Room Settings</h2>
          <p>Configure your auction</p>

          {error && <div className="notification error" style={{ position: 'relative', marginBottom: '1rem' }}>{error}</div>}

          <div className="settings-panel">
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
                <label>Bid Timer (seconds)</label>
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

            <h4 style={{ marginTop: '1rem' }}>🏟️ Teams</h4>
            <div className="team-selector">
              {TEAMS.map(team => (
                <div
                  key={team.code}
                  className={`team-chip ${team.color} ${selectedTeams.includes(team.code) ? 'selected' : ''}`}
                  onClick={() => toggleTeam(team.code)}
                >
                  {team.name}
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleCreateRoom} disabled={loading}>
            {loading ? 'Creating...' : '🚀 Create Room'}
          </button>
          <button className="btn btn-secondary" onClick={() => setMode('home')}>
            ← Back
          </button>
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
