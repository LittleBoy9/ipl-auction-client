import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { sounds } from '../utils/sounds';
import Confetti from '../components/Confetti';

export default function AuctionRoom({ roomData: initialRoomData, playerId }) {
  const { socket } = useSocket();
  const [room, setRoom] = useState(initialRoomData);
  const [timer, setTimer] = useState(0);
  // Removed: big overlay replaced with toast notifications
  const [chatMsg, setChatMsg] = useState('');
  const [notification, setNotification] = useState(null);
  const [autoBidMax, setAutoBidMax] = useState('');
  const [showAutoBidInput, setShowAutoBidInput] = useState(false);
  const [dramaText, setDramaText] = useState(null); // 'GOING ONCE' | 'GOING TWICE' | null
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reactions, setReactions] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [finalRankings, setFinalRankings] = useState(null);
  const [activeTab, setActiveTab] = useState('auction');
  const [poolFilter, setPoolFilter] = useState('all');
  const [poolSearch, setPoolSearch] = useState('');

  const me = room.players.find(p => p.id === playerId);
  const isHost = me?.isHost || false;

  // Sound effects on timer
  useEffect(() => {
    if (!soundEnabled) return;
    if (timer === 3) { sounds.goingOnce(); setDramaText('GOING ONCE...'); }
    if (timer === 2) { sounds.goingTwice(); setDramaText('GOING TWICE...'); }
    if (timer === 1) { setDramaText('SOLD!'); }
    if (timer > 3 && dramaText) { setDramaText(null); }
    if (timer <= 5 && timer > 0) { sounds.tick(); }
  }, [timer, soundEnabled]);

  useEffect(() => {
    if (!socket) return;

    const handleRoomUpdate = (data) => {
      setRoom(data.room);
    };

    const handleTimerUpdate = (data) => {
      setTimer(data.timer);
    };

    const handlePlayerSold = (data) => {
      setRoom(data.room);
      setShowAutoBidInput(false);
      setAutoBidMax('');
      setDramaText(null);
      if (data.winnerId === playerId) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      if (soundEnabled) {
        if (data.winnerId === playerId) sounds.win();
        else sounds.sold();
      }
      showNotification(
        data.winnerId === playerId 
          ? `🔨 You won ${data.player.name} for ₹${data.price}Cr!` 
          : `🔨 ${data.player.name} → ${data.winnerName} (₹${data.price}Cr)`,
        data.winnerId === playerId ? 'success' : 'default'
      );
    };

    const handlePlayerUnsold = (data) => {
      setRoom(data.room);
      setDramaText(null);
      if (soundEnabled) sounds.unsold();
      showNotification(`❌ ${data.player.name} unsold`, 'error');
    };

    const handleAuctionStarted = (data) => {
      setRoom(data.room);
      setTimer(data.room.settings.bidTimer);
      setShowAutoBidInput(false);
      setAutoBidMax('');
      showNotification('🚀 Auction Started!', 'success');
    };

    const handleAuctionEnded = (data) => {
      setRoom(data.room);
      setFinalRankings(data.rankings || []);
    };

    const handleNewPlayer = (data) => {
      setRoom(data.room);
      setTimer(data.room.settings.bidTimer);
      setShowAutoBidInput(false);
      setAutoBidMax('');
    };

    const handleBidPlaced = (data) => {
      setRoom(data.room);
      setTimer(data.room.settings.bidTimer);
      if (soundEnabled) {
        if (data.botBid) sounds.autoBid();
        else if (data.autoBid) sounds.autoBid();
        else sounds.bidPlaced();
      }
      // If someone outbid me
      if (data.bidderId !== playerId && room?.currentBidder === playerId) {
        if (soundEnabled) sounds.outbid();
      }
    };

    const handleReaction = (data) => {
      const newReaction = { ...data, id: Date.now() + Math.random() };
      setReactions(prev => [...prev.slice(-10), newReaction]);
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== newReaction.id));
      }, 3000);
    };

    const handleError = (data) => {
      showNotification(data.message, 'error');
    };

    const handleNewHost = (data) => {
      setRoom(data.room);
      if (data.hostId === playerId) {
        showNotification('You are now the host!', 'success');
      }
    };

    const handlePlayerJoined = (data) => {
      setRoom(data.room);
      showNotification(`${data.player.name} joined!`, 'success');
    };

    const handlePlayerDisconnected = (data) => {
      setRoom(data.room);
      showNotification('A player disconnected', 'error');
    };

    socket.on('room-update', handleRoomUpdate);
    socket.on('timer-update', handleTimerUpdate);
    socket.on('player-sold', handlePlayerSold);
    socket.on('player-unsold', handlePlayerUnsold);
    socket.on('auction-started', handleAuctionStarted);
    socket.on('auction-ended', handleAuctionEnded);
    socket.on('new-player', handleNewPlayer);
    socket.on('bid-placed', handleBidPlaced);
    socket.on('error', handleError);
    socket.on('new-host', handleNewHost);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('player-disconnected', handlePlayerDisconnected);
    socket.on('auction-paused', handleRoomUpdate);
    socket.on('auction-resumed', handleRoomUpdate);
    socket.on('auto-bid-updated', handleRoomUpdate);
    socket.on('new-reaction', handleReaction);
    socket.on('bot-added', handleRoomUpdate);
    socket.on('bot-removed', handleRoomUpdate);

    return () => {
      socket.off('room-update', handleRoomUpdate);
      socket.off('timer-update', handleTimerUpdate);
      socket.off('player-sold', handlePlayerSold);
      socket.off('player-unsold', handlePlayerUnsold);
      socket.off('auction-started', handleAuctionStarted);
      socket.off('auction-ended', handleAuctionEnded);
      socket.off('new-player', handleNewPlayer);
      socket.off('bid-placed', handleBidPlaced);
      socket.off('error', handleError);
      socket.off('new-host', handleNewHost);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('player-disconnected', handlePlayerDisconnected);
      socket.off('auction-paused', handleRoomUpdate);
      socket.off('auction-resumed', handleRoomUpdate);
      socket.off('auto-bid-updated', handleRoomUpdate);
      socket.off('new-reaction', handleReaction);
      socket.off('bot-added', handleRoomUpdate);
      socket.off('bot-removed', handleRoomUpdate);
    };
  }, [socket, playerId]);

  const showNotification = useCallback((msg, type) => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const placeBid = (amount) => {
    if (!socket || room.status !== 'auctioning') return;
    socket.emit('place-bid', { roomCode: room.code, amount });
  };

  const startAuction = () => {
    if (!socket || !isHost) return;
    socket.emit('start-auction', { roomCode: room.code });
  };

  const togglePause = () => {
    if (!socket || !isHost) return;
    socket.emit('toggle-pause', { roomCode: room.code });
  };

  const skipPlayer = () => {
    if (!socket || !isHost) return;
    socket.emit('skip-player', { roomCode: room.code });
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!socket || !chatMsg.trim()) return;
    socket.emit('send-chat', { roomCode: room.code, message: chatMsg.trim() });
    setChatMsg('');
  };

  const sendReaction = (emoji) => {
    if (!socket) return;
    socket.emit('send-reaction', { roomCode: room.code, emoji });
  };

  const addBot = () => {
    if (!socket || !isHost) return;
    socket.emit('add-bot', { roomCode: room.code });
  };

  const removeBot = (botId) => {
    if (!socket || !isHost) return;
    socket.emit('remove-bot', { roomCode: room.code, botId });
  };

  const getNextBidAmount = () => {
    if (!room.currentPlayer) return 0;
    const current = room.currentBid > 0 ? room.currentBid : room.currentPlayer.basePrice;
    let increment = 0.30; // default 30L above 5Cr
    if (current < 0.50) increment = 0.05;        // below 50L: +5L
    else if (current < 1.00) increment = 0.10;   // 50L to 1Cr: +10L
    else if (current < 5.00) increment = 0.25;   // 1Cr to 5Cr: +25L
    return parseFloat((current + increment).toFixed(2));
  };

  const calculateStarRating = (player) => {
    let score = 50; // base
    if (player.battingAvg && player.strikeRate) {
      score = Math.max(score, (player.battingAvg * player.strikeRate) / 100);
    }
    if (player.wickets !== null && player.economy) {
      score = Math.max(score, player.wickets * (12 - Math.min(player.economy, 12)) * 3);
    }
    if (player.basePrice >= 10) score += 15;
    else if (player.basePrice >= 5) score += 10;
    else if (player.basePrice >= 2) score += 5;
    
    if (score >= 90) return 5;
    if (score >= 70) return 4;
    if (score >= 50) return 3;
    if (score >= 30) return 2;
    return 1;
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const calculatePlayerScore = (player) => {
    let batScore = 0, bowlScore = 0;
    
    if (player.battingAvg && player.strikeRate) {
      batScore = Math.min(100, (player.battingAvg * player.strikeRate) / 200);
    }
    if (player.wickets !== null && player.economy) {
      bowlScore = Math.min(100, player.wickets * (15 - Math.min(player.economy, 15)) / 15 * 8);
    }
    
    if (player.role === 'Batter' || player.role === 'WK-Batter') return Math.round(batScore);
    if (player.role === 'Bowler') return Math.round(bowlScore);
    if (player.role === 'All-rounder') return Math.round((batScore + bowlScore) / 2);
    return Math.round(batScore || bowlScore || 50);
  };

  const calculateTeamScore = (team) => {
    if (!team || team.length === 0) return 0;
    const total = team.reduce((sum, p) => sum + calculatePlayerScore(p), 0);
    return Math.round(total / Math.max(team.length, 11));
  };

  const getSquadBalance = (team) => {
    const counts = { 'WK-Batter': 0, 'Batter': 0, 'Bowler': 0, 'All-rounder': 0 };
    team?.forEach(p => {
      if (counts[p.role] !== undefined) counts[p.role]++;
    });
    return {
      wk: { have: counts['WK-Batter'], need: 1 },
      batters: { have: counts['Batter'] + counts['WK-Batter'], need: 3 },
      bowlers: { have: counts['Bowler'], need: 3 },
      allRounders: { have: counts['All-rounder'], need: 1 },
    };
  };

  const toggleAutoBid = () => {
    if (!socket || !room.currentPlayer) return;
    const maxPrice = parseFloat(autoBidMax);
    if (!me?.autoBid?.enabled && (!maxPrice || maxPrice <= 0)) {
      showNotification('Enter a max price first!', 'error');
      return;
    }
    const enabled = !me?.autoBid?.enabled;
    socket.emit('toggle-auto-bid', {
      roomCode: room.code,
      enabled,
      maxPrice: enabled ? maxPrice : 0
    });
    if (enabled) {
      showNotification('🤖 Auto Bid ON!', 'success');
    } else {
      showNotification('Auto Bid OFF', 'error');
    }
  };

  const getBidIncrementLabel = () => {
    if (!room.currentPlayer) return '';
    const current = room.currentBid > 0 ? room.currentBid : room.currentPlayer.basePrice;
    if (current < 0.50) return '+₹5L';
    if (current < 1.00) return '+₹10L';
    if (current < 5.00) return '+₹25L';
    return '+₹30L';
  };

  const getBudgetColor = (budget, max) => {
    const pct = (budget / max) * 100;
    if (pct > 50) return '#00ff88';
    if (pct > 25) return '#ffcc00';
    return '#ff6b6b';
  };

  // Waiting screen
  if (room.status === 'waiting') {
    return (
      <div className="lobby-container">
        <div className="lobby-card">
          <h2>⏳ Waiting Room</h2>
          
          <div className="room-code-display">
            <h3>Room Code</h3>
            <div className="room-code">{room.code}</div>
          </div>

          <p>Share this code with your friends!</p>

          <div style={{ textAlign: 'left', margin: '1.5rem 0' }}>
            <h4 style={{ marginBottom: '1rem', color: '#e94560' }}>👥 Players ({room.players.length})</h4>
            {room.players.map(p => (
              <div key={p.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.5rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                marginBottom: '0.5rem'
              }}>
                <span>{p.connected ? '🟢' : '🔴'}{p.isBot ? '🤖' : ''}</span>
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                {p.isHost && <span style={{ fontSize: '0.7rem', background: '#e94560', padding: '2px 8px', borderRadius: '4px' }}>HOST</span>}
                {p.isBot && isHost && (
                  <button 
                    onClick={() => removeBot(p.id)}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            
            {isHost && room.players.filter(p => p.connected).length < 10 && (
              <button 
                onClick={addBot}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  marginTop: '0.5rem',
                  background: 'rgba(0,184,148,0.1)',
                  border: '1.5px dashed rgba(0,184,148,0.4)',
                  borderRadius: '8px',
                  color: '#00ff88',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                + Add AI Bot
              </button>
            )}
          </div>

          <div style={{ textAlign: 'left', margin: '1rem 0', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#e94560' }}>⚙️ Settings</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
              💰 Budget: ₹{room.settings.budget} Cr | 👥 Squad: {room.settings.squadSize} | ⏱️ Timer: {room.settings.bidTimer}s
            </p>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
              🏏 Teams: {room.settings.teams?.length || 10}/10 | 🎯 Players: {room.totalPlayers}
            </p>
          </div>

          {isHost && (
            <button className="btn btn-primary" onClick={startAuction}>
              🚀 Start Auction
            </button>
          )}

          {!isHost && (
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Waiting for host to start...</p>
          )}
        </div>
      </div>
    );
  }

  // Ended screen
  if (room.status === 'ended') {
    const rankings = finalRankings || [];
    return (
      <div className="lobby-container">
        <div className="lobby-card" style={{ maxWidth: '700px' }}>
          <h2>🏆 Auction Complete!</h2>
          <p>Final Rankings</p>

          <table className="rankings-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Team Size</th>
                <th>Spent</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r, i) => (
                <tr key={i}>
                  <td className={`rank-${r.rank}`}>#{r.rank}</td>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>{r.teamSize}</td>
                  <td>₹{r.spent.toFixed(1)} Cr</td>
                  <td>₹{r.remaining.toFixed(1)} Cr</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>📋 All Squads</h3>
            {room.players.map(p => (
              <div key={p.id} style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                <h4 style={{ color: '#e94560', marginBottom: '0.5rem' }}>{p.name} ({p.team.length} players)</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {p.team.map((tp, i) => (
                    <span key={i} style={{ 
                      fontSize: '0.8rem', 
                      padding: '0.3rem 0.6rem', 
                      background: 'rgba(255,255,255,0.05)', 
                      borderRadius: '6px' 
                    }}>
                      {tp.name} (₹{tp.soldPrice}Cr)
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            🔄 Play Again
          </button>
        </div>
      </div>
    );
  }

  // Auction screen
  if (!me) {
    return (
      <div className="lobby-container">
        <div className="lobby-card">
          <h2>⏳ Loading...</h2>
          <p>Reconnecting to auction...</p>
        </div>
      </div>
    );
  }

  const renderTabBar = () => (
    <div style={{
      gridColumn: '1 / -1',
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '0.5rem',
      padding: '0.5rem',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.06)'
    }}>
      {[
        { key: 'auction', label: '🔨 Auction', show: room.status === 'auctioning' || room.status === 'paused' },
        { key: 'teams', label: '👥 Teams', show: true },
        { key: 'pool', label: '📋 Player Pool', show: room.allPlayers?.length > 0 },
      ].filter(t => t.show).map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          style={{
            flex: 1,
            padding: '0.7rem 1rem',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === tab.key ? 'linear-gradient(135deg, #e94560, #c73e54)' : 'transparent',
            color: '#fff',
            fontWeight: activeTab === tab.key ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'inherit'
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  // TEAMS TAB
  const renderTeamsTab = () => (
    <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
      {room.players.map(p => {
        const score = calculateTeamScore(p.team);
        const bal = getSquadBalance(p.team);
        const isMe = p.id === playerId;
        return (
          <div key={p.id} style={{
            background: 'rgba(255,255,255,0.04)',
            border: isMe ? '2px solid rgba(233,69,96,0.4)' : '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '1.2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {isMe ? '👤 ' : ''}{p.name}
                  {p.isHost && ' 👑'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                  {p.connected ? '🟢 Online' : '🔴 Offline'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: score > 0 ? '#00ff88' : 'rgba(255,255,255,0.3)' }}>
                  {score > 0 ? score : '—'}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Team Score</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.8rem', fontSize: '0.8rem' }}>
              <span>💰 ₹{p.budget.toFixed(1)}Cr left</span>
              <span>💸 ₹{p.spent.toFixed(1)}Cr spent</span>
              <span>👥 {p.team.length}/{room.settings.squadSize}</span>
            </div>
            
            {/* Squad Balance Mini */}
            <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.8rem' }}>
              {[
                { icon: '🧤', have: bal.wk.have, need: bal.wk.need },
                { icon: '🏏', have: bal.batters.have, need: bal.batters.need },
                { icon: '🎯', have: bal.bowlers.have, need: bal.bowlers.need },
                { icon: '⚡', have: bal.allRounders.have, need: bal.allRounders.need },
              ].map((item, i) => (
                <span key={i} style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  background: item.have >= item.need ? 'rgba(0,184,148,0.15)' : 'rgba(255,107,107,0.15)',
                  color: item.have >= item.need ? '#00ff88' : '#ff6b6b'
                }}>
                  {item.icon} {item.have}/{item.need}
                </span>
              ))}
            </div>
            
            {/* Squad List */}
            {p.team.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No players yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {p.team.map((tp, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}>
                    <img src={tp.image} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.src = 'https://via.placeholder.com/28?text=P'} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{tp.name}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{tp.role}</div>
                    </div>
                    <div style={{ color: '#00ff88', fontWeight: 600, fontSize: '0.8rem' }}>₹{tp.soldPrice}Cr</div>
                    <div style={{ fontSize: '0.75rem' }}>{renderStars(calculateStarRating(tp))}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // PLAYER POOL TAB
  const renderPoolTab = () => {
    const searched = poolSearch.trim() 
      ? room.allPlayers.filter(p => p.name.toLowerCase().includes(poolSearch.toLowerCase()))
      : room.allPlayers;
    
    const filtered = poolFilter === 'all' 
      ? searched 
      : searched.filter(p => p.role === poolFilter);
    
    const categories = [
      { key: 'all', label: 'All', count: room.allPlayers?.length || 0 },
      { key: 'Batter', label: 'Batters', count: room.allPlayers?.filter(p => p.role === 'Batter').length || 0 },
      { key: 'Bowler', label: 'Bowlers', count: room.allPlayers?.filter(p => p.role === 'Bowler').length || 0 },
      { key: 'All-rounder', label: 'All-Rounders', count: room.allPlayers?.filter(p => p.role === 'All-rounder').length || 0 },
      { key: 'WK-Batter', label: 'WK-Batters', count: room.allPlayers?.filter(p => p.role === 'WK-Batter').length || 0 },
    ];
    
    return (
      <div style={{ gridColumn: '1 / -1' }}>
        {/* Search Bar */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="🔍 Search players..."
            value={poolSearch}
            onChange={(e) => setPoolSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.7rem 1rem',
              borderRadius: '10px',
              border: '1.5px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              color: '#fff',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
          {poolSearch.trim() && (
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setPoolFilter(cat.key)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                border: poolFilter === cat.key ? '2px solid #e94560' : '1.5px solid rgba(255,255,255,0.1)',
                background: poolFilter === cat.key ? 'rgba(233,69,96,0.15)' : 'rgba(255,255,255,0.03)',
                color: '#fff',
                fontWeight: poolFilter === cat.key ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
        
        {/* Pool Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.8rem' }}>
          {filtered.map(p => {
            const stars = calculateStarRating(p);
            const isSold = p.status === 'sold';
            const isUnsold = p.status === 'unsold';
            const isCurrent = p.status === 'current';
            
            return (
              <div key={p.id} style={{
                background: isCurrent ? 'rgba(233,69,96,0.1)' : 'rgba(255,255,255,0.03)',
                border: isCurrent ? '2px solid rgba(233,69,96,0.3)' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '1rem',
                opacity: isSold ? 0.5 : 1,
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Status badge */}
                {isSold && (
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    padding: '0.15rem 0.5rem',
                    background: '#00b894',
                    borderRadius: '6px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#fff'
                  }}>
                    SOLD
                  </div>
                )}
                {isUnsold && (
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    padding: '0.15rem 0.5rem',
                    background: '#ff4757',
                    borderRadius: '6px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#fff'
                  }}>
                    UNSOLD
                  </div>
                )}
                {isCurrent && (
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    padding: '0.15rem 0.5rem',
                    background: '#e94560',
                    borderRadius: '6px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#fff',
                    animation: 'pulse 1s ease infinite'
                  }}>
                    NOW
                  </div>
                )}
                
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.2rem' }}>{p.name}</div>
                <div style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>{renderStars(stars)}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.5rem' }}>
                  {p.role} • {p.nationality}
                </div>
                
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {p.battingAvg && (
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>Avg: {p.battingAvg}</span>
                  )}
                  {p.strikeRate && (
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>SR: {p.strikeRate}</span>
                  )}
                  {p.wickets !== null && (
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>Wkts: {p.wickets}</span>
                  )}
                  {p.economy && (
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>Econ: {p.economy}</span>
                  )}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#ffd700' }}>₹{p.basePrice}Cr</span>
                  {isSold && (
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                      → {p.soldTo} (₹{p.soldPrice}Cr)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="auction-container">
      {renderTabBar()}
      
      {activeTab === 'teams' && renderTeamsTab()}
      {activeTab === 'pool' && renderPoolTab()}
      
      {activeTab === 'auction' && (
      <>
      {/* Left Panel - Players & Chat */}
      <div className="side-panel">
        {/* LIVE LEADERBOARD */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3>🏆 Leaderboard</h3>
          {[...room.players]
            .sort((a, b) => calculateTeamScore(b.team) - calculateTeamScore(a.team))
            .map((p, idx) => {
              const pct = (p.budget / room.settings.budget) * 100;
              const score = calculateTeamScore(p.team);
              const isMe = p.id === playerId;
              return (
                <div key={p.id} style={{ 
                  padding: '0.7rem', 
                  background: isMe ? 'rgba(233,69,96,0.1)' : 'rgba(255,255,255,0.03)', 
                  borderRadius: '10px', 
                  marginBottom: '0.4rem',
                  opacity: p.connected ? 1 : 0.5,
                  border: isMe ? '1px solid rgba(233,69,96,0.3)' : '1px solid transparent'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      #{idx + 1} {isMe ? '👤 ' : ''}{p.name}
                      {p.isHost && ' 👑'}
                      {p.isBot && ' 🤖'}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: score > 0 ? '#00ff88' : 'rgba(255,255,255,0.3)' }}>
                      {score > 0 ? `${score} pts` : '—'}
                    </span>
                  </div>
                  <div className="budget-bar">
                    <div 
                      className="fill" 
                      style={{ 
                        width: `${pct}%`, 
                        background: getBudgetColor(p.budget, room.settings.budget) 
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>
                    <span>{p.team.length}/{room.settings.squadSize} players</span>
                    <span>₹{p.budget.toFixed(1)}Cr left</span>
                  </div>
                </div>
              );
            })}
        </div>

        <div>
          <h3>💬 Chat</h3>
          <div className="chat-box">
            <div className="chat-messages">
              {room.chat?.map(msg => (
                <div key={msg.id} className="chat-message">
                  <span className="sender">{msg.playerName}</span>
                  <div>{msg.message}</div>
                </div>
              ))}
            </div>
            <form className="chat-input" onSubmit={sendChat}>
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                maxLength={100}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>

        {/* BID HISTORY */}
        {room.bidHistory?.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3>📜 Bid History</h3>
            <div style={{
              padding: '0.8rem',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '10px',
              maxHeight: '150px',
              overflowY: 'auto'
            }}>
              {room.bidHistory.map((bid, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  padding: '0.25rem 0',
                  borderBottom: i < room.bidHistory.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                }}>
                  <span>{bid.bidderName} {bid.bidderId?.startsWith('bot-') ? '🤖' : ''}</span>
                  <span style={{ color: '#ffd700', fontWeight: 600 }}>₹{bid.amount >= 1 ? bid.amount.toFixed(2) + 'Cr' : (bid.amount * 100).toFixed(0) + 'L'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Center - Player Card & Bidding */}
      <div>
        {/* Progress */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem',
          padding: '0.8rem 1.2rem',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px'
        }}>
          <span style={{ fontSize: '0.9rem' }}>
            🏏 Player {room.soldCount + room.unsoldCount + 1} / {room.totalPlayers}
          </span>
          <span style={{ fontSize: '0.9rem', color: '#00ff88' }}>
            ✅ Sold: {room.soldCount} | ❌ Unsold: {room.unsoldCount}
          </span>
          {isHost && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={togglePause}
                style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: 'none', background: '#e94560', color: '#fff', cursor: 'pointer' }}
              >
                {room.status === 'paused' ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button 
                onClick={skipPlayer}
                style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}
              >
                ⏭️ Skip
              </button>
            </div>
          )}
        </div>

        {room.status === 'paused' && (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            background: 'rgba(255,193,7,0.1)', 
            borderRadius: '16px',
            marginBottom: '1rem',
            border: '2px solid rgba(255,193,7,0.3)'
          }}>
            <h2>⏸️ Auction Paused</h2>
            <p>Waiting for host to resume...</p>
          </div>
        )}

        {room.currentPlayer && (
          <div className="player-card">
            {/* Top Section: Image + Name + Role */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
              <img 
                src={room.currentPlayer.image} 
                alt={room.currentPlayer.name}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid rgba(255,255,255,0.2)',
                  flexShrink: 0
                }}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/90?text=P'; }}
              />
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.2 }}>{room.currentPlayer.name}</div>
                <div style={{ fontSize: '0.95rem', marginTop: '0.2rem' }}>
                  {renderStars(calculateStarRating(room.currentPlayer))}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.2rem' }}>
                  {room.currentPlayer.role} &nbsp;•&nbsp; {room.currentPlayer.nationality}
                </div>
                <div style={{ 
                  display: 'inline-block',
                  marginTop: '0.4rem',
                  padding: '0.2rem 0.8rem',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  Base: ₹{room.currentPlayer.basePrice >= 1 ? room.currentPlayer.basePrice + 'Cr' : (room.currentPlayer.basePrice * 100).toFixed(0) + 'L'}
                </div>
                {/* Smart Highlight: show if this role is needed */}
                {(() => {
                  const bal = getSquadBalance(me?.team || []);
                  const needs = [];
                  if (room.currentPlayer.role === 'WK-Batter' && bal.wk.have < bal.wk.need) needs.push('🧤 Need WK!');
                  if ((room.currentPlayer.role === 'Batter' || room.currentPlayer.role === 'WK-Batter') && bal.batters.have < bal.batters.need) needs.push('🏏 Need Batter!');
                  if (room.currentPlayer.role === 'Bowler' && bal.bowlers.have < bal.bowlers.need) needs.push('🎯 Need Bowler!');
                  if (room.currentPlayer.role === 'All-rounder' && bal.allRounders.have < bal.allRounders.need) needs.push('⚡ Need All-rounder!');
                  if (needs.length > 0) {
                    return (
                      <div style={{
                        display: 'inline-block',
                        marginLeft: '0.5rem',
                        padding: '0.2rem 0.7rem',
                        background: 'linear-gradient(135deg, #ffd700, #ffb700)',
                        color: '#1a1a2e',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        animation: 'pulse 1s ease infinite'
                      }}>
                        {needs[0]}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* Compact Stats Row */}
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '1.5rem',
              position: 'relative',
              zIndex: 1
            }}>
              {[
                { label: 'M', value: room.currentPlayer.matches },
                { label: 'Runs', value: room.currentPlayer.runs },
                ...(room.currentPlayer.battingAvg ? [{ label: 'Avg', value: room.currentPlayer.battingAvg }] : []),
                ...(room.currentPlayer.strikeRate ? [{ label: 'SR', value: room.currentPlayer.strikeRate }] : []),
                ...(room.currentPlayer.wickets !== null ? [{ label: 'Wkts', value: room.currentPlayer.wickets }] : []),
                ...(room.currentPlayer.economy ? [{ label: 'Econ', value: room.currentPlayer.economy }] : []),
              ].map((stat, i) => (
                <div key={i} style={{
                  padding: '0.4rem 0.9rem',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  textAlign: 'center',
                  minWidth: '60px'
                }}>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 }}>{stat.label}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Timer + Bid Section - MOVED UP */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Current Bid Info */}
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                {room.currentBid > 0 ? (
                  <div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.2rem' }}>
                      Current Bid by <strong style={{ color: '#ffd700' }}>{room.currentBidder}</strong>
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#00ff88' }}>
                      ₹{room.currentBid >= 1 ? room.currentBid.toFixed(2) + 'Cr' : (room.currentBid * 100).toFixed(0) + 'L'}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>Starting Bid</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>
                      ₹{room.currentPlayer.basePrice >= 1 ? room.currentPlayer.basePrice + 'Cr' : (room.currentPlayer.basePrice * 100).toFixed(0) + 'L'}
                    </div>
                  </div>
                )}
              </div>

              {/* Timer */}
              <div className={`timer-display ${timer <= 5 ? 'warning' : ''}`} style={{ fontSize: '3.5rem', margin: '0.5rem 0' }}>
                {timer}
                <span style={{ fontSize: '1rem', opacity: 0.5 }}>s</span>
              </div>

              {/* DRAMA OVERLAY */}
              {dramaText && timer <= 3 && timer > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: timer === 1 ? '4rem' : '3rem',
                  fontWeight: 900,
                  color: timer === 1 ? '#ffd700' : '#ff6b6b',
                  textShadow: '0 0 40px rgba(255,255,255,0.3)',
                  zIndex: 10,
                  animation: timer === 1 ? 'pulse 0.3s ease infinite' : 'none',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap'
                }}>
                  {dramaText}
                </div>
              )}

              {/* Sound Toggle */}
              <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: soundEnabled ? '#00ff88' : 'rgba(255,255,255,0.3)',
                    fontSize: '1.2rem',
                    cursor: 'pointer'
                  }}
                  title={soundEnabled ? 'Sound ON' : 'Sound OFF'}
                >
                  {soundEnabled ? '🔊' : '🔇'}
                </button>
              </div>

              {/* BIG BID BUTTON */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
                {room.currentBidder === playerId ? (
                  <div style={{
                    padding: '1rem 2.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '14px',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}>
                    ⏳ You have the highest bid!<br/>
                    <span style={{ fontSize: '0.8rem' }}>Wait for someone else to bid</span>
                  </div>
                ) : (
                  <button
                    onClick={() => placeBid(getNextBidAmount())}
                    disabled={room.status !== 'auctioning' || getNextBidAmount() > me?.budget || (me?.team?.length || 0) >= room.settings.squadSize}
                    style={{
                      padding: '1rem 2.5rem',
                      fontSize: '1.3rem',
                      fontWeight: 800,
                      background: room.status === 'auctioning' && getNextBidAmount() <= me?.budget && (me?.team?.length || 0) < room.settings.squadSize 
                        ? 'linear-gradient(135deg, #e94560, #ff6b6b)' 
                        : 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: '14px',
                      color: '#fff',
                      cursor: room.status === 'auctioning' && getNextBidAmount() <= me?.budget && (me?.team?.length || 0) < room.settings.squadSize ? 'pointer' : 'not-allowed',
                      boxShadow: room.status === 'auctioning' && getNextBidAmount() <= me?.budget && (me?.team?.length || 0) < room.settings.squadSize 
                        ? '0 6px 25px rgba(233,69,96,0.4)' 
                        : 'none',
                      transition: 'all 0.2s',
                      minWidth: '260px'
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', opacity: 0.85, marginBottom: '0.15rem' }}>
                      {getBidIncrementLabel()} Increment
                    </div>
                    <div>BID ₹{getNextBidAmount() >= 1 ? getNextBidAmount().toFixed(2) + 'Cr' : (getNextBidAmount() * 100).toFixed(0) + 'L'}</div>
                  </button>
                )}
              </div>

              {/* AUTO BID SECTION */}
              {room.status === 'auctioning' && room.currentBidder !== playerId && (me?.team?.length || 0) < room.settings.squadSize && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: '0.6rem',
                  marginTop: '0.8rem'
                }}>
                  {showAutoBidInput ? (
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem', 
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '0.6rem 1rem',
                      borderRadius: '12px'
                    }}>
                      <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Max:</span>
                      <input
                        type="number"
                        step="0.1"
                        min={getNextBidAmount()}
                        max={me?.budget}
                        placeholder={`${getNextBidAmount()}`}
                        value={autoBidMax}
                        onChange={(e) => setAutoBidMax(e.target.value)}
                        style={{
                          width: '90px',
                          padding: '0.4rem 0.6rem',
                          borderRadius: '8px',
                          border: '1.5px solid rgba(255,255,255,0.15)',
                          background: 'rgba(255,255,255,0.05)',
                          color: '#fff',
                          fontSize: '0.9rem',
                          fontFamily: 'inherit'
                        }}
                      />
                      <span style={{ fontSize: '0.8rem' }}>Cr</span>
                      <button
                        onClick={toggleAutoBid}
                        style={{
                          padding: '0.4rem 1rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#00b894',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        ON
                      </button>
                      <button
                        onClick={() => { setShowAutoBidInput(false); setAutoBidMax(''); }}
                        style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAutoBidInput(true)}
                      style={{
                        padding: '0.5rem 1.2rem',
                        borderRadius: '10px',
                        border: me?.autoBid?.enabled ? '2px solid #00b894' : '1.5px solid rgba(255,255,255,0.15)',
                        background: me?.autoBid?.enabled ? 'rgba(0,184,148,0.15)' : 'rgba(255,255,255,0.04)',
                        color: me?.autoBid?.enabled ? '#00b894' : 'rgba(255,255,255,0.6)',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      🤖 Auto Bid {me?.autoBid?.enabled ? `ON (₹${me?.autoBid?.maxPrice}Cr)` : 'OFF'}
                    </button>
                  )}
                </div>
              )}

              {/* Show other auto-bidders */}
              {room.players?.some(p => p.id !== playerId && p.autoBid?.enabled) && (
                <div style={{ 
                  display: 'flex', 
                  gap: '0.4rem', 
                  justifyContent: 'center',
                  marginTop: '0.6rem',
                  flexWrap: 'wrap'
                }}>
                  {room.players.filter(p => p.id !== playerId && p.autoBid?.enabled).map(p => (
                    <span key={p.id} style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.6rem',
                      background: 'rgba(0,184,148,0.12)',
                      color: '#00b894',
                      borderRadius: '10px',
                      fontWeight: 600
                    }}>
                      🤖 {p.name} auto-bidding up to ₹{p.autoBid.maxPrice}Cr
                    </span>
                  ))}
                </div>
              )}

              {/* Budget warning */}
              {(me?.team?.length || 0) >= room.settings.squadSize && (
                <div style={{ textAlign: 'center', color: '#ff6b6b', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.5rem' }}>
                  ⚠️ Your squad is full!
                </div>
              )}
              {getNextBidAmount() > me?.budget && room.status === 'auctioning' && (me?.team?.length || 0) < room.settings.squadSize && (
                <div style={{ textAlign: 'center', color: '#ff6b6b', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.5rem' }}>
                  ⚠️ Not enough budget!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Reactions */}
      {reactions.map(r => (
        <div
          key={r.id}
          style={{
            position: 'fixed',
            left: `${20 + Math.random() * 60}%`,
            bottom: '15%',
            fontSize: '2.5rem',
            zIndex: 500,
            animation: 'float-up 3s ease-out forwards',
            pointerEvents: 'none',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ fontSize: '0.7rem', textAlign: 'center', color: '#fff', marginBottom: '0.2rem', fontWeight: 600 }}>
            {r.playerName}
          </div>
          {r.emoji}
        </div>
      ))}
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          15% { transform: translateY(-30px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-300px) scale(0.8); opacity: 0; }
        }
      `}</style>

      {/* Confetti */}
      <Confetti active={showConfetti} />

      {/* Right Panel - My Team */}
      <div className="side-panel">
        <h3>🎯 My Team ({me?.team?.length || 0}/{room.settings.squadSize})</h3>

        {/* TEAM SCORE */}
        {me?.team?.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,184,148,0.15), rgba(0,214,170,0.05))',
            border: '1px solid rgba(0,184,148,0.2)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>Team Strength</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#00ff88' }}>
              {calculateTeamScore(me?.team || [])}
            </div>
            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>/100 avg</div>
          </div>
        )}

        {/* SQUAD BALANCE */}
        {me?.team?.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: '#e94560' }}>Squad Balance</div>
            {(() => {
              const bal = getSquadBalance(me?.team || []);
              const items = [
                { label: 'Wicket Keeper', have: bal.wk.have, need: bal.wk.need, icon: '🧤' },
                { label: 'Batters (incl WK)', have: bal.batters.have, need: bal.batters.need, icon: '🏏' },
                { label: 'Bowlers', have: bal.bowlers.have, need: bal.bowlers.need, icon: '🎯' },
                { label: 'All-Rounders', have: bal.allRounders.have, need: bal.allRounders.need, icon: '⚡' },
              ];
              return items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.4rem 0.6rem',
                  background: item.have >= item.need ? 'rgba(0,184,148,0.08)' : 'rgba(255,107,107,0.08)',
                  borderRadius: '8px',
                  marginBottom: '0.3rem',
                  fontSize: '0.8rem'
                }}>
                  <span>{item.icon} {item.label}</span>
                  <span style={{ fontWeight: 700, color: item.have >= item.need ? '#00ff88' : '#ff6b6b' }}>
                    {item.have}/{item.need}
                  </span>
                </div>
              ));
            })()}
          </div>
        )}
        
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span>Budget Left</span>
            <span style={{ color: '#00ff88', fontWeight: 700 }}>₹{me?.budget?.toFixed(1) || 0}Cr</span>
          </div>
          <div className="budget-bar">
            <div 
              className="fill" 
              style={{ 
                width: `${((me?.budget || 0) / room.settings.budget) * 100}%`,
                background: getBudgetColor(me?.budget || 0, room.settings.budget)
              }}
            />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
            Spent: ₹{me?.spent?.toFixed(1) || 0}Cr
          </div>
        </div>

        {me?.team?.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '2rem 0' }}>
            No players yet. Start bidding!
          </p>
        )}

        {me?.team?.map((p, i) => (
          <div key={i} className="team-member">
            <img 
              src={p.image} 
              alt={p.name}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/32?text=P'; }}
            />
            <div>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{p.role} | {p.team}</div>
            </div>
            <div className="price">₹{p.soldPrice}Cr</div>
          </div>
        ))}

        {/* Reaction Buttons */}
        {room.status === 'auctioning' && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3>💬 Reactions</h3>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {['🔥', '😱', '💰', '😂', '👏', '🥵'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => sendReaction(emoji)}
                  style={{
                    padding: '0.4rem 0.7rem',
                    fontSize: '1.3rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.15)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Sales */}
        <div style={{ marginTop: '1.5rem' }}>
          <h3>📝 Recent Sales</h3>
          {room.soldPlayers?.slice(-5).reverse().map((sale, i) => (
            <div key={i} style={{ 
              fontSize: '0.8rem', 
              padding: '0.5rem', 
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: '8px',
              marginBottom: '0.4rem'
            }}>
              <strong>{sale.player.name}</strong> → {sale.soldToName}
              <div style={{ color: '#00ff88' }}>₹{sale.soldPrice}Cr</div>
            </div>
          ))}
          {(!room.soldPlayers || room.soldPlayers.length === 0) && (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>No sales yet</p>
          )}
        </div>
      </div>
      </>
      )}

      {/* Floating Reactions */}
      {reactions.map(r => (
        <div
          key={r.id}
          style={{
            position: 'fixed',
            left: `${20 + Math.random() * 60}%`,
            bottom: '15%',
            fontSize: '2.5rem',
            zIndex: 500,
            animation: 'float-up 3s ease-out forwards',
            pointerEvents: 'none',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ fontSize: '0.7rem', textAlign: 'center', color: '#fff', marginBottom: '0.2rem', fontWeight: 600 }}>
            {r.playerName}
          </div>
          {r.emoji}
        </div>
      ))}
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          15% { transform: translateY(-30px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-300px) scale(0.8); opacity: 0; }
        }
      `}</style>

      {/* Confetti */}
      <Confetti active={showConfetti} />

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.msg}
        </div>
      )}
    </div>
  );
}
