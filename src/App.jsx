import { useState, useEffect } from 'react'
import { useSocket, SocketProvider } from './context/SocketContext'
import Lobby from './pages/Lobby'
import AuctionRoom from './pages/AuctionRoom'

function App() {
  const { socket, connected } = useSocket()
  const [gameState, setGameState] = useState('lobby') // lobby, room
  const [roomData, setRoomData] = useState(null)
  const [playerId, setPlayerId] = useState(null)
  const [showRejoinPrompt, setShowRejoinPrompt] = useState(false)
  const [savedSession, setSavedSession] = useState(null)
  const [reconnecting, setReconnecting] = useState(false)

  // Check for saved session on load
  useEffect(() => {
    const saved = localStorage.getItem('ipl-auction-session')
    if (saved) {
      setSavedSession(JSON.parse(saved))
      setShowRejoinPrompt(true)
    }
  }, [])

  const handleRejoin = () => {
    if (!socket || !connected || !savedSession) return
    setReconnecting(true)
    
    socket.emit('join-room', { 
      roomCode: savedSession.roomCode, 
      playerName: savedSession.playerName 
    })
    
    socket.once('joined-room', (data) => {
      setRoomData(data.room)
      setPlayerId(data.playerId)
      setGameState('room')
      setShowRejoinPrompt(false)
      setReconnecting(false)
    })
    
    socket.once('error', (data) => {
      console.log('Rejoin failed:', data.message)
      localStorage.removeItem('ipl-auction-session')
      setShowRejoinPrompt(false)
      setReconnecting(false)
    })
  }

  const handleDismissRejoin = () => {
    localStorage.removeItem('ipl-auction-session')
    setShowRejoinPrompt(false)
    setSavedSession(null)
  }

  const handleRoomJoined = (data) => {
    setRoomData(data.room)
    setPlayerId(data.playerId)
    setGameState('room')
    const playerName = data.room.players.find(p => p.id === data.playerId)?.name || ''
    localStorage.setItem('ipl-auction-session', JSON.stringify({
      roomCode: data.room.code,
      playerName: playerName
    }))
  }

  const handleRoomCreated = (data) => {
    setRoomData(data.room)
    setPlayerId(data.room.hostId)
    setGameState('room')
    const playerName = data.room.players.find(p => p.id === data.room.hostId)?.name || ''
    localStorage.setItem('ipl-auction-session', JSON.stringify({
      roomCode: data.room.code,
      playerName: playerName
    }))
  }

  const handleLeaveRoom = () => {
    localStorage.removeItem('ipl-auction-session')
    setRoomData(null)
    setPlayerId(null)
    setGameState('lobby')
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-left">
          <div className="header-logo">🏏</div>
          <div className="header-title">
            <span className="header-ipl">IPL 2026</span>
            <span className="header-auction">AUCTION</span>
          </div>
        </div>
        {roomData && (
          <div className="header-room">
            <span className="room-label">ROOM</span>
            <span className="room-code-badge">{roomData.code}</span>
          </div>
        )}
      </header>

      {/* Rejoin Prompt Overlay */}
      {showRejoinPrompt && gameState === 'lobby' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10,10,26,0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          gap: '1rem',
          padding: '2rem'
        }}>
          <div style={{ fontSize: '3rem' }}>⚡</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>You have an active session!</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.6 }}>
            Room: <strong>{savedSession?.roomCode}</strong> • Player: <strong>{savedSession?.playerName}</strong>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleRejoin}
              disabled={reconnecting}
              style={{ minWidth: '140px' }}
            >
              {reconnecting ? 'Reconnecting...' : '↩️ Rejoin'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleDismissRejoin}
              style={{ minWidth: '140px' }}
            >
              ❌ Leave
            </button>
          </div>
        </div>
      )}

      {reconnecting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10,10,26,0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          gap: '1rem'
        }}>
          <div style={{ fontSize: '2rem' }}>⚡</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>Reconnecting...</div>
        </div>
      )}

      {gameState === 'lobby' && (
        <Lobby 
          onRoomCreated={handleRoomCreated}
          onRoomJoined={handleRoomJoined}
        />
      )}

      {gameState === 'room' && roomData && (
        <AuctionRoom 
          roomData={roomData}
          playerId={playerId}
          onLeave={handleLeaveRoom}
        />
      )}
    </div>
  )
}

function AppWrapper() {
  return (
    <SocketProvider>
      <App />
    </SocketProvider>
  )
}

export default AppWrapper
