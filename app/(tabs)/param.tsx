import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '@/services/auth/authService';
import { logErrorForDev } from '@/utils/errors/getUserFacingError';
import NavBar from '@/components/NavBar';

const BG = '#0D0D0F';
const SURF = '#1A1A1F';
const ACCENT = '#00F0F0';
const TEXT = '#FAFAFA';
const TEXT_MUT = 'rgba(255,255,255,0.60)';
const TEXT_DIM = 'rgba(255,255,255,0.40)';
const BORDER = 'rgba(0,240,240,0.16)';
const BORDER_S = 'rgba(255,255,255,0.06)';

export default function ParamScreen() {
  const handleLogout = async () => {
    try {
      await authService.logout();
      router.replace('/(auth)/entry');
    } catch (error) {
      logErrorForDev('auth.logout', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top glow */}
      <View style={styles.topGlow} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenLabel}>PROFIL</Text>
        <Text style={styles.screenTitle}>Paramètres</Text>
      </View>

      {/* Avatar placeholder */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={36} color={ACCENT} />
        </View>
        <Text style={styles.avatarLabel}>Mon compte</Text>
      </View>

      {/* Settings rows */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="notifications-outline" size={20} color={TEXT_MUT} />
          <Text style={styles.rowText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={16} color={TEXT_DIM} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.row}>
          <Ionicons name="musical-notes-outline" size={20} color={TEXT_MUT} />
          <Text style={styles.rowText}>Préférences musicales</Text>
          <Ionicons name="chevron-forward" size={16} color={TEXT_DIM} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.row}>
          <Ionicons name="shield-outline" size={20} color={TEXT_MUT} />
          <Text style={styles.rowText}>Confidentialité</Text>
          <Ionicons name="chevron-forward" size={16} color={TEXT_DIM} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={18} color="#0A0B33" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      <NavBar active="user" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 240,
    backgroundColor: 'rgba(0,240,240,0.06)',
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  screenLabel: {
    fontSize: 11,
    letterSpacing: 3,
    color: ACCENT,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: TEXT,
    letterSpacing: -0.8,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(0,240,240,0.12)',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: TEXT,
  },
  section: {
    marginHorizontal: 16,
    backgroundColor: SURF,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER_S,
    overflow: 'hidden',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    color: TEXT,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER_S,
    marginLeft: 54,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    marginHorizontal: 24,
    borderRadius: 999,
    backgroundColor: ACCENT,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0B33',
  },
});
