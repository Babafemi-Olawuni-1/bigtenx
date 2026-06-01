// Detect local development environment
const hostname = window.location.hostname
const isLocal = hostname === 'localhost'
  || hostname === '127.0.0.1'
  || hostname.startsWith('192.168.')
  || hostname.startsWith('10.')
  || hostname.startsWith('172.')

export const API = isLocal
  ? `http://${hostname}/bigtenx/bigtenx/api`
  : `${window.location.origin}/api`
