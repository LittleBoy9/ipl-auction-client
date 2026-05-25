import { useState } from 'react'
import { SocketProvider } from './context/SocketContext'
import Lobby from './pages/Lobby'
import AuctionRoom from './pages/AuctionRoom'

function App() {
  const [gameState, setGameState] = useState('lobby') // lobby, room
  const [roomData, setRoomData] = useState(null)
  const [playerId, setPlayerId] = useState(null)

  const handleRoomJoined = (data) => {
    setRoomData(data.room)
    setPlayerId(data.playerId)
    setGameState('room')
  }

  const handleRoomCreated = (data) => {
    setRoomData(data.room)
    setPlayerId(data.room.hostId)
    setGameState('room')
  }

  return (
    <SocketProvider>
      <div className="app-container">
        <header className="header">
          <h1>
            🏏 IPL 2026
            <span className="ipl-badge">AUCTION</span>
          </h1>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
            {roomData && `Room: ${roomData.code}`}
          </div>
        </header>

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
          />
        )}
      </div>
    </SocketProvider>
  )
}

export default App
