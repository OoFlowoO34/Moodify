import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logErrorForDev } from '@/utils/errors/getUserFacingError';

const API_URL = 'https://dm-developpement.fr/moodify';

export const authService = {
  async login(email: string, password: string): Promise<void> {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username: email,
        password,
      });
      const token: string | undefined = response.data.token_connexion;
      if (!token) throw new Error('No token received from server');
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      logErrorForDev('auth.login', error);
      throw error;
    }
  },

  async createAccount(email: string, password: string): Promise<void> {
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        username: email,
        password,
      });
      const token: string | undefined = response.data.token_creation;
      if (!token) throw new Error('No token received from server');
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      logErrorForDev('auth.signup', error);
      throw error;
    }
  },

  async forgottenPassword(email: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/forgot_password`, { username: email });
    } catch (error) {
      logErrorForDev('auth.forgot_password', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      logErrorForDev('auth.logout', error);
      throw error;
    }
  },

  async getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem('auth_token');
  },
};
