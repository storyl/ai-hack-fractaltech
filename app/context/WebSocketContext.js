'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const WebSocketContext = createContext(null)

export function WebSocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [username, setUsername] = useState('')

  useEffect(() => {
    const initSocket = async () => {
      await fetch('/api/socketio')
      const newSocket = io('/', {
        path: '/api/socketio',
      })
      setSocket(newSocket)
    }

    if (!socket) {
      initSocket()
    }

    return () => {
      if (socket) {
        socket.emit('disconnectUser', username)
        socket.disconnect()
      }
    }
  }, [socket, username])

  const connectWithUsername = (newUsername) => {
    setUsername(newUsername)
    if (socket) {
      socket.emit('setUsername', newUsername)
    }
  }

  return (
    <WebSocketContext.Provider value={{ socket, username, connectWithUsername }}>
      {children}
    </WebSocketContext.Provider>
  )
}