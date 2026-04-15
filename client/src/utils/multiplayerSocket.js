/**
 * Multiplayer Socket Service
 * Manages WebSocket connection for multiplayer game modes (Flag & Quiz)
 * Singleton pattern to ensure single connection across components
 */

import { io } from 'socket.io-client';

const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const browserProtocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
const browserHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const apiPort = (import.meta.env.VITE_API_PORT || '3000').trim() || '3000';

function resolveApiUrl() {
  const sameHostUrl = `${browserProtocol}//${browserHost}:${apiPort}`;

  if (!configuredApiUrl) {
    return sameHostUrl;
  }

  if (typeof window === 'undefined') {
    return configuredApiUrl;
  }

  try {
    const parsedUrl = new URL(configuredApiUrl);
    const configuredHost = parsedUrl.hostname.toLowerCase();
    const currentHost = browserHost.toLowerCase();
    const localhostHosts = ['localhost', '127.0.0.1', '::1'];
    const configuredIsLocalhost = localhostHosts.includes(configuredHost);
    const currentIsLocalhost = localhostHosts.includes(currentHost);

    // If the app is opened from another device, don't force localhost from .env.
    if (configuredIsLocalhost && !currentIsLocalhost) {
      const resolvedPort = parsedUrl.port || apiPort;
      return `${parsedUrl.protocol}//${browserHost}:${resolvedPort}`;
    }

    return configuredApiUrl;
  } catch {
    return sameHostUrl;
  }
}

const API_URL = resolveApiUrl();

// Singleton socket instance for multiplayer
let multiplayerSocket = null;
let connectionListeners = [];

/**
 * Get or create the multiplayer socket connection
 * @returns {Socket} Socket.IO client instance
 */
export function getMultiplayerSocket() {
  if (!multiplayerSocket) {
    multiplayerSocket = io(API_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling']
    });

    multiplayerSocket.on('connect', () => {
      console.log('🎮 Multiplayer socket connected:', multiplayerSocket.id);
      connectionListeners.forEach(cb => cb(true));
    });

    multiplayerSocket.on('disconnect', (reason) => {
      console.log('🎮 Multiplayer socket disconnected:', reason);
      connectionListeners.forEach(cb => cb(false));
    });

    multiplayerSocket.on('connect_error', (error) => {
      console.error('🎮 Multiplayer socket connection error:', error.message);
    });
  }
  return multiplayerSocket;
}

/**
 * Register a connection status listener
 * @param {Function} callback - Called with (isConnected: boolean)
 * @returns {Function} Cleanup function to remove listener
 */
export function onConnectionChange(callback) {
  connectionListeners.push(callback);
  return () => {
    connectionListeners = connectionListeners.filter(cb => cb !== callback);
  };
}

/**
 * Join a multiplayer room
 * @param {string} roomId - Unique room identifier
 * @param {string} playerName - Display name for the player
 * @param {string} gameMode - 'flag' or 'quiz'
 * @param {string|null} difficulty - Optional difficulty for quiz mode
 */
export function joinRoom(roomId, playerName, gameMode, difficulty = null) {
  const socket = getMultiplayerSocket();
  socket.emit('join-room', { roomId, playerName, gameMode, difficulty });
}

/**
 * Leave the current room
 * @param {string} roomId - Room to leave
 */
export function leaveRoom(roomId) {
  const socket = getMultiplayerSocket();
  socket.emit('leave-room', { roomId });
}

/**
 * Submit an answer for the current question
 * @param {string} roomId - Current room ID
 * @param {string} answer - Player's answer (country name)
 */
export function submitAnswer(roomId, answer) {
  const socket = getMultiplayerSocket();
  socket.emit('submit-answer', { roomId, answer });
}

/**
 * Request current room information
 * @param {string} roomId - Room to get info for
 */
export function getRoomInfo(roomId) {
  const socket = getMultiplayerSocket();
  socket.emit('get-room-info', { roomId });
}

/**
 * Subscribe to multiplayer events
 * @param {Object} handlers - Event handler functions
 * @returns {Function} Cleanup function to unsubscribe all handlers
 */
export function subscribeToEvents(handlers) {
  const socket = getMultiplayerSocket();
  
  const events = [
    'player-joined',
    'player-left',
    'game-started',
    'new-question',
    'player-answered',
    'show-result',
    'next-round',
    'game-over',
    'game-ended',
    'room-error',
    'answer-error',
    'room-info'
  ];

  // Subscribe to each event if handler provided
  events.forEach(event => {
    if (handlers[event]) {
      socket.on(event, handlers[event]);
    }
  });

  // Return cleanup function
  return () => {
    events.forEach(event => {
      if (handlers[event]) {
        socket.off(event, handlers[event]);
      }
    });
  };
}

/**
 * Disconnect the multiplayer socket (use when leaving multiplayer section)
 */
export function disconnectMultiplayer() {
  if (multiplayerSocket) {
    multiplayerSocket.disconnect();
    multiplayerSocket = null;
  }
}

/**
 * Check if socket is currently connected
 * @returns {boolean}
 */
export function isConnected() {
  return multiplayerSocket?.connected || false;
}

/**
 * Generate a random room ID
 * @returns {string} 6-character room code
 */
export function generateRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar-looking chars
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default {
  getMultiplayerSocket,
  onConnectionChange,
  joinRoom,
  leaveRoom,
  submitAnswer,
  getRoomInfo,
  subscribeToEvents,
  disconnectMultiplayer,
  isConnected,
  generateRoomId
};
