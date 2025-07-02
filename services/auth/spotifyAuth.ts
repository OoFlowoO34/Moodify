import { makeRedirectUri, useAuthRequest, ResponseType } from "expo-auth-session";

// Variables globales
const CLIENT_ID = "e15990807bdc450e8e0eb3c334ebe07c";
const REDIRECT_URI = makeRedirectUri({
  scheme: "exp",
});
const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
];

// Configuration OAuth
const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

export const useSpotifyAuth = () => {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: SCOPES,
      responseType: ResponseType.Token,
      redirectUri: REDIRECT_URI,
    },
    discovery
  );

  return { request, response, promptAsync };
};