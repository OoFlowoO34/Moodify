import React, { useEffect, useState } from "react";
import { Button, Text, View, StyleSheet, Alert, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSpotifyAuth } from "../../services/auth/spotifyAuth";
import SpotifyWebPlayer from "../../components/SpotifyWebPlayer";
import { SpotifyWebPlaybackService, SpotifyPlayerState } from "../../services/spotify/spotifyWebPlayback";

export default function Spotify(){
  const { request, response, promptAsync } = useSpotifyAuth();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<SpotifyPlayerState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [playbackService, setPlaybackService] = useState<SpotifyWebPlaybackService | null>(null);

  // Gérer la réponse OAuth
  useEffect(() => {
    if (response?.type === "success" && response.params.access_token) {
      setAccessToken(response.params.access_token);
      setPlaybackService(new SpotifyWebPlaybackService(response.params.access_token));
    }
  }, [response]);

  const handlePlayerReady = (deviceId: string) => {
    setDeviceId(deviceId);
    Alert.alert("Success", "Spotify Player is ready!");
  };

  const handlePlayerStateChange = (state: SpotifyPlayerState) => {
    setPlayerState(state);
  };

  const handlePlayerError = (error: string) => {
    Alert.alert("Player Error", error);
  };

  const searchTracks = async () => {
    if (!playbackService || !searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const tracks = await playbackService.searchTracks(searchQuery);
      setSearchResults(tracks);
    } catch (error) {
      Alert.alert("Search Error", "Failed to search tracks");
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const playTrack = async (uri: string) => {
    if (!playbackService) return;
    
    try {
      await playbackService.playTrack(uri);
    } catch (error) {
      Alert.alert("Playback Error", "Failed to play track");
      console.error("Playback error:", error);
    }
  };

  const renderTrack = ({ item }: any) => (
    <TouchableOpacity style={styles.trackItem} onPress={() => playTrack(item.uri)}>
      <View style={styles.trackInfo}>
        <Text style={styles.trackName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {item.artists.map((artist: any) => artist.name).join(", ")}
        </Text>
        <Text style={styles.trackAlbum} numberOfLines={1}>{item.album.name}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!accessToken) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Connect to Spotify</Text>
        <Button
          title="Login to Spotify"
          onPress={() => promptAsync()}
          disabled={!request}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spotify Player</Text>
      
      {/* Player Status */}
      {deviceId && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Device Connected: {deviceId.substring(0, 8)}...</Text>
          {playerState && (
            <Text style={styles.statusText}>
              Now Playing: {playerState.track_window.current_track.name}
            </Text>
          )}
        </View>
      )}

      {/* Search Section */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for tracks..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchTracks}
        />
        <Button title="Search" onPress={searchTracks} disabled={isSearching} />
      </View>

      {/* Loading Indicator */}
      {isSearching && <ActivityIndicator size="large" color="#1db954" />}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Search Results:</Text>
          <FlatList
            data={searchResults}
            renderItem={renderTrack}
            keyExtractor={(item: any) => item.id}
            style={styles.resultsList}
          />
        </View>
      )}

      {/* Spotify Web Player */}
      <View style={styles.playerContainer}>
        <SpotifyWebPlayer
          accessToken={accessToken}
          onPlayerReady={handlePlayerReady}
          onPlayerStateChange={handlePlayerStateChange}
          onError={handlePlayerError}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191414",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1db954",
    textAlign: "center",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "white",
  },
  statusContainer: {
    backgroundColor: "#282828",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusText: {
    color: "white",
    fontSize: 14,
    marginBottom: 5,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#282828",
    color: "white",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  resultsTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  resultsList: {
    maxHeight: 200,
  },
  trackItem: {
    backgroundColor: "#282828",
    padding: 15,
    marginBottom: 8,
    borderRadius: 8,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  trackArtist: {
    color: "#b3b3b3",
    fontSize: 14,
    marginBottom: 2,
  },
  trackAlbum: {
    color: "#8a8a8a",
    fontSize: 12,
  },
  playerContainer: {
    flex: 1,
    minHeight: 300,
    backgroundColor: "#191414",
    borderRadius: 8,
    overflow: "hidden",
  },
});