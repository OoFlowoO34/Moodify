import { StyleSheet, Image, Platform, View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { authService } from '@/services/auth/authService';
import * as AuthSession from 'expo-auth-session';
import React, { useState } from 'react';

// Remplacez par vos propres valeurs
const CLIENT_ID = '638093ee58804e048c23d1b68164f63a';  // Obtenez-le depuis votre application Spotify
const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'com.moodify.app',  // Remplacez par votre schéma personnalisé (doit correspondre à votre configuration Spotify)
});

const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

const SCOPES = ['user-read-private', 'user-read-email'];

const discovery = {
  authorizationEndpoint: AUTH_ENDPOINT,
  tokenEndpoint: TOKEN_ENDPOINT,
};
export default function TabTwoScreen() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: SCOPES,
      redirectUri: REDIRECT_URI,
      responseType: AuthSession.ResponseType.Token,
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success' && response.params.access_token) {
      setAccessToken(response.params.access_token);
    } else if (response?.type === 'error') {
      setError('Erreur d\'authentification : ' + response.error?.message);
    }
  }, [response]);

  const handleLogin = () => {
    promptAsync();
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.replace("/(auth)/entry");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <View>
      <Button 
        mode="outlined" 
        icon="logout" 
        onPress={handleLogout}
        style={{ marginTop: 20 }}
      >
        Se déconnecter
      </Button>
      
        <Button onPress={handleLogin} disabled={!request}>
          Se connecter avec Spotify
        </Button>
        {accessToken && <Text style={styles.tokenText}>Token d'accès: {accessToken}</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
    container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tokenText: {
    marginTop: 20,
    fontSize: 14,
    color: 'green',
  },
  errorText: {
    marginTop: 20,
    fontSize: 14,
    color: 'red',
  },
});