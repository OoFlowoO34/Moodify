import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { SpotifyWebPlaybackService, SpotifyPlayerState } from '../services/spotify/spotifyWebPlayback';

interface SpotifyWebPlayerProps {
  accessToken: string;
  onPlayerReady?: (deviceId: string) => void;
  onPlayerStateChange?: (state: SpotifyPlayerState) => void;
  onError?: (error: string) => void;
}

export default function SpotifyWebPlayer({ 
  accessToken, 
  onPlayerReady, 
  onPlayerStateChange, 
  onError 
}: SpotifyWebPlayerProps) {
  const webViewRef = useRef<WebView>(null);
  const [playbackService] = useState(new SpotifyWebPlaybackService(accessToken));
  const [isReady, setIsReady] = useState(false);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'ready':
          console.log('Spotify Player Ready:', data.device_id);
          playbackService.setDeviceId(data.device_id);
          setIsReady(true);
          onPlayerReady?.(data.device_id);
          break;
          
        case 'player_state_changed':
          console.log('Player State Changed:', data.state);
          onPlayerStateChange?.(data.state);
          break;
          
        case 'error':
          console.error('Spotify Player Error:', data.message);
          onError?.(data.message);
          Alert.alert('Spotify Error', data.message);
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const sendCommand = (command: any) => {
    if (webViewRef.current && isReady) {
      webViewRef.current.postMessage(JSON.stringify(command));
    }
  };

  // Méthodes publiques pour contrôler le player
  const play = (uri?: string) => {
    sendCommand({ type: 'play', uri });
  };

  const pause = () => {
    sendCommand({ type: 'pause' });
  };

  const next = () => {
    sendCommand({ type: 'next' });
  };

  const previous = () => {
    sendCommand({ type: 'previous' });
  };

  const setVolume = (volume: number) => {
    sendCommand({ type: 'volume', volume });
  };

  // Expose methods via ref (removed the problematic useImperativeHandle)

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: playbackService.generateWebViewHTML() }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onError={(error) => {
          console.error('WebView Error:', error);
          onError?.('WebView failed to load');
        }}
        onHttpError={(error) => {
          console.error('WebView HTTP Error:', error);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191414',
  },
  webview: {
    flex: 1,
    backgroundColor: '#191414',
  },
});
