export interface SpotifyDevice {
  device_id: string;
  name: string;
  type: string;
  volume_percent: number;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
}

export interface SpotifyTrack {
  uri: string;
  id: string;
  type: string;
  name: string;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  artists: Array<{ name: string; uri: string }>;
  duration_ms: number;
}

export interface SpotifyPlayerState {
  device: SpotifyDevice;
  track_window: {
    current_track: SpotifyTrack;
    previous_tracks: SpotifyTrack[];
    next_tracks: SpotifyTrack[];
  };
  timestamp: number;
  position: number;
  duration: number;
  paused: boolean;
  shuffle: boolean;
  repeat_mode: number;
}

export class SpotifyWebPlaybackService {
  private accessToken: string;
  private deviceId: string | null = null;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Créer le HTML pour la WebView avec le Spotify Web Playback SDK
  generateWebViewHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Spotify Web Playback SDK</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            background: #191414;
            color: white;
        }
        .player-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }
        .track-info {
            text-align: center;
        }
        .track-image {
            width: 200px;
            height: 200px;
            border-radius: 8px;
        }
        .controls {
            display: flex;
            gap: 15px;
            align-items: center;
        }
        button {
            background: #1db954;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
        }
        button:disabled {
            background: #535353;
            cursor: not-allowed;
        }
        .progress-bar {
            width: 100%;
            height: 4px;
            background: #535353;
            border-radius: 2px;
            margin: 10px 0;
        }
        .progress {
            height: 100%;
            background: #1db954;
            border-radius: 2px;
            transition: width 0.1s;
        }
    </style>
</head>
<body>
    <div class="player-container">
        <div id="loading">Initializing Spotify Player...</div>
        <div id="player" style="display: none;">
            <div class="track-info">
                <img id="track-image" class="track-image" src="" alt="Album Art">
                <h2 id="track-name">-</h2>
                <p id="track-artist">-</p>
            </div>
            <div class="progress-bar">
                <div id="progress" class="progress" style="width: 0%"></div>
            </div>
            <div class="controls">
                <button onclick="previousTrack()">⏮</button>
                <button id="play-pause" onclick="togglePlay()">▶️</button>
                <button onclick="nextTrack()">⏭</button>
            </div>
            <div>
                <button onclick="setVolume(0.5)">🔉</button>
                <button onclick="setVolume(1.0)">🔊</button>
            </div>
        </div>
    </div>

    <script src="https://sdk.scdn.co/spotify-player.js"></script>
    <script>
        let player;
        let deviceId;
        let currentState;

        window.onSpotifyWebPlaybackSDKReady = () => {
            const token = '${this.accessToken}';
            player = new Spotify.Player({
                name: 'Moodify Web Player',
                getOAuthToken: cb => { cb(token); },
                volume: 0.5
            });

            // Error handling
            player.addListener('initialization_error', ({ message }) => {
                console.error('Failed to initialize:', message);
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'error',
                    message: message
                }));
            });

            player.addListener('authentication_error', ({ message }) => {
                console.error('Failed to authenticate:', message);
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'error',
                    message: 'Authentication failed'
                }));
            });

            player.addListener('account_error', ({ message }) => {
                console.error('Failed to validate Spotify account:', message);
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'error',
                    message: 'Account validation failed'
                }));
            });

            player.addListener('playback_error', ({ message }) => {
                console.error('Failed to perform playback:', message);
            });

            // Playback status updates
            player.addListener('player_state_changed', state => {
                if (!state) return;
                
                currentState = state;
                updateUI(state);
                
                // Envoyer l'état au React Native
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'player_state_changed',
                    state: state
                }));
            });

            // Ready
            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                deviceId = device_id;
                document.getElementById('loading').style.display = 'none';
                document.getElementById('player').style.display = 'block';
                
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'ready',
                    device_id: device_id
                }));
            });

            // Not Ready
            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            // Connect to the player!
            player.connect();
        };

        function updateUI(state) {
            const track = state.track_window.current_track;
            
            document.getElementById('track-name').textContent = track.name;
            document.getElementById('track-artist').textContent = track.artists.map(a => a.name).join(', ');
            document.getElementById('track-image').src = track.album.images[0]?.url || '';
            document.getElementById('play-pause').textContent = state.paused ? '▶️' : '⏸️';
            
            // Progress bar
            const progress = (state.position / state.duration) * 100;
            document.getElementById('progress').style.width = progress + '%';
        }

        function togglePlay() {
            player.togglePlay();
        }

        function nextTrack() {
            player.nextTrack();
        }

        function previousTrack() {
            player.previousTrack();
        }

        function setVolume(volume) {
            player.setVolume(volume);
        }

        // Écouter les messages de React Native
        document.addEventListener('message', function(event) {
            try {
                const data = JSON.parse(event.data);
                handleCommand(data);
            } catch (e) {
                console.error('Error parsing message:', e);
            }
        });

        function handleCommand(command) {
            switch(command.type) {
                case 'play':
                    if (command.uri) {
                        playTrack(command.uri);
                    } else {
                        player.resume();
                    }
                    break;
                case 'pause':
                    player.pause();
                    break;
                case 'next':
                    player.nextTrack();
                    break;
                case 'previous':
                    player.previousTrack();
                    break;
                case 'volume':
                    player.setVolume(command.volume);
                    break;
            }
        }

        function playTrack(uri) {
            fetch(\`https://api.spotify.com/v1/me/player/play?device_id=\${deviceId}\`, {
                method: 'PUT',
                body: JSON.stringify({ uris: [uri] }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer ${this.accessToken}\`
                },
            });
        }
    </script>
</body>
</html>
    `;
  }

  // Méthodes pour contrôler le player depuis React Native
  async playTrack(uri: string) {
    if (!this.deviceId) throw new Error('Device not ready');
    
    const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({ uris: [uri] }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to play track');
    }
  }

  async searchTracks(query: string, limit: number = 20) {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search tracks');
    }

    const data = await response.json();
    return data.tracks.items;
  }

  setDeviceId(deviceId: string) {
    this.deviceId = deviceId;
  }
}
