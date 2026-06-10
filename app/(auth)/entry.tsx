import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import { CircularWaveform } from "@/components/CircularWaveform";

const BG = '#0D0D0F';
const ACCENT = '#00F0F0';
const TEXT = '#FAFAFA';
const TEXT_MUT = 'rgba(255,255,255,0.60)';
const TEXT_DIM = 'rgba(255,255,255,0.40)';
const BORDER_S = 'rgba(255,255,255,0.06)';

const EntryScreen = () => {
  return (
    <View style={styles.container}>
      
      <View style={styles.logoAndCircleContainer}>
        <View style={styles.heroVisual}>
          <CircularWaveform />
          <View style={styles.largeTealCircle}>
            <View style={styles.glowBg} />
            <Image
              source={require('@/assets/images/moodify_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* Hero headline — positioned below the circular waveform */}
      <View style={styles.heroText}>
        <Text style={styles.title}>
          Ta journée en{'\n'}
          <Text style={styles.titleAccent}>fréquence.</Text>
        </Text>
        <Text style={styles.subtitle}>
          Capture ton humeur.{'\n'}Moodify écrit la bande-son.
        </Text>
      </View>

      {/* Call-to-action buttons */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(auth)/signup")}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Commencer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ghostButton}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.7}
        >
          <Text style={styles.ghostButtonText}>J'ai déjà un compte</Text>
        </TouchableOpacity>
      </View>

      {/* Version stamp */}
      <Text style={styles.version}>MOODIFY · V2.4</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoAndCircleContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  heroVisual: {
    width: 340,
    height: 340,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  largeTealCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#072426',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 240, 0.15)',
    zIndex: 2,
  },
  glowBg: {
    position: 'absolute',
    backgroundColor: ACCENT,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  logo: {
    width: '85%',
    height: '85%',
    zIndex: 2,
  },
  heroText: {
    position: 'absolute',
    top: 400,
    left: 32,
    right: 32,
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 42,
    fontWeight: '600',
    color: TEXT,
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: -1,
    marginBottom: 18,
  },
  titleAccent: {
    color: ACCENT,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_MUT,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 12,
  },
  ctaContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 72,
    gap: 12,
    zIndex: 10,
  },
  primaryButton: {
    height: 56,
    borderRadius: 999,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0B33',
    letterSpacing: -0.2,
  },
  ghostButton: {
    height: 56,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER_S,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  ghostButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: TEXT_MUT,
  },
  version: {
    position: 'absolute',
    bottom: 30,
    fontSize: 10,
    letterSpacing: 3,
    color: TEXT_DIM,
    textTransform: 'uppercase',
  },
});

export default EntryScreen;
