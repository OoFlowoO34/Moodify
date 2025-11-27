import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

// URL de l'API backend (à configurer selon votre environnement)
const API_URL = __DEV__ ? 'https://developpement.tech/moodify' : 'https://my-json-server.typicode.com/OoFlowoO34/mockjson';

// Service pour gérer les appels d'API liés à l'authentification
export const authService = {
  // Connexion utilisateur
  async login(email: string, password: string) {
    try {
      console.log('login email:', email);
      console.log('login mdp:', password)
      // Appel à votre API backend qui gèrera l'authentification Firebase
      const response = await axios.post(`${API_URL}/login`, {
        username: email,
        password: password,
      });
      const token = response.data.token_connexion;

      // Stockage du token dans AsyncStorage
      console.log('Token reçu:', token);
      if (token) {
        await AsyncStorage.setItem('auth_token', token);  
        router.replace("/(tabs)/camera");
      }
      else {
        await AsyncStorage.setItem('auth_token', ""); 
        router.replace("/(auth)/entry"); 
      }
      
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  },

    // Create user
    async createAccount(email: string, password: string) {
      try {
        console.log('createAccount email:', email);
        console.log('createAccount mdp:', password)
        // Appel à votre API backend qui gèrera l'authentification Firebase
        const response = await axios.post(`${API_URL}/signup`, {
          username: email,
          password: password,
        });
        const token = response.data.token_creation;
  
        // Stockage du token dans AsyncStorage
        console.log('Token reçu:', token);
        if (token) {
          await AsyncStorage.setItem('auth_token', token);  
          router.replace("/(tabs)/camera");
        }
        
      } catch (error) {
        console.error('Erreur de connexion:', error);
        throw error;
      }
    },

    async forgottenPassword(email: string) {
      try {
        console.log('forgottenPassword email:', email);
        // Appel à votre API backend qui gèrera l'authentification Firebase
        const response = await axios.post(`${API_URL}/forgot_password`, {
          username: email,
        });
        console.log("envoie forgottenPassword réussie");
      } catch (error) {
        console.error('Erreur de connexion:', error);
        throw error;
      }
    },

  // Déconnexion
  async logout() {
    try {
      // Supprimer les données du token et utilisateur
      await AsyncStorage.removeItem('auth_token');
      console.log('Token et données utilisateur supprimés');
      // Optionnel: rediriger l'utilisateur vers la page de login ou autre
      router.replace("/login");

      return true;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  },

  // Vérification de l'état d'authentification
  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  },

  // Récupération du token pour les requêtes authentifiées
  async getAuthToken() {
    return await AsyncStorage.getItem('auth_token');
  }
};

// Hook d'authentification pour les composants React
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, user, loading };
};

// Créer un client Axios avec authentification automatique
export const createAuthenticatedClient = () => {
  const client = axios.create({
    baseURL: API_URL
  });

  // Intercepteur pour ajouter le token d'authentification aux requêtes
  client.interceptors.request.use(async (config) => {
    const token = await authService.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
};