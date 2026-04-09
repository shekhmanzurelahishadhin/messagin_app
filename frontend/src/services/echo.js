import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echoInstance = null;

export const getEcho = (token) => {
  console.log('getEcho called with token:', token ? 'Token exists' : 'No token');
  
  if (!echoInstance) {
    window.Pusher = Pusher;
    
    const appKey = import.meta.env.VITE_REVERB_APP_KEY;
    const host = import.meta.env.VITE_REVERB_HOST;
    const port = import.meta.env.VITE_REVERB_PORT;
    const scheme = import.meta.env.VITE_REVERB_SCHEME;
    
    // If token is not passed, try to get it from localStorage with the correct key
    const authToken = token || localStorage.getItem('auth_token');
    
    console.log('Auth token being used:', authToken ? 'Exists' : 'Missing');
    
    const config = {
      broadcaster: 'reverb',
      key: appKey,
      wsHost: host,
      wsPort: port,
      forceTLS: scheme === 'https',
      enabledTransports: ['ws', 'wss'],
      
      authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/json',
        },
      },
    };
    
    console.log('Initializing Echo with config:', config);
    echoInstance = new Echo(config);
    
    // Debug connection
    if (echoInstance.connector && echoInstance.connector.pusher) {
      echoInstance.connector.pusher.connection.bind('connected', () => {
        console.log('✅ Connected to Reverb server');
      });
      
      echoInstance.connector.pusher.connection.bind('error', (error) => {
        console.error('❌ Reverb connection error:', error);
      });
    }
  }
  
  return echoInstance;
};

export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    console.log('Echo disconnected');
  }
};