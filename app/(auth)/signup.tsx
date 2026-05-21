import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { authService } from "@/services/auth/authService";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFeedback, UserFacingError } from "@/contexts/FeedbackContext";

const BG = '#0D0D0F';
const ACCENT = '#00F0F0';
const TEXT = '#FAFAFA';
const TEXT_MUT = 'rgba(255,255,255,0.60)';
const TEXT_DIM = 'rgba(255,255,255,0.40)';
const BORDER_INPUT = 'rgba(255,255,255,0.16)';
const BORDER_S = 'rgba(255,255,255,0.06)';

const SignUpScreen = () => {
  const { showError } = useFeedback();
  const [email, setEmail] = useState("test1@example.com");
  const [password, setPassword] = useState("password1234");
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    if (!email || !password) {
      showError(
        new UserFacingError("Champs requis", "Veuillez remplir tous les champs.")
      );
      return;
    }

    setLoading(true);
    try {
      await authService.createAccount(email, password);
      router.replace("/(tabs)/camera");
    } catch (error) {
      showError(error, "auth_signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Subtle top glow */}
      <View style={styles.topGlow} />

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color={TEXT} />
      </TouchableOpacity>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>NOUVEAU COMPTE</Text>
        <Text style={styles.heading}>Créer un compte</Text>

        {/* Email field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="votre@email.com"
            placeholderTextColor={TEXT_DIM}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>MOT DE PASSE</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••••••"
            placeholderTextColor={TEXT_DIM}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleCreateAccount}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Création…" : "Commencer"}
          </Text>
          {!loading && <Ionicons name="arrow-forward" size={18} color="#0A0B33" />}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Déjà un compte? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.loginLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

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
    height: 200,
    backgroundColor: 'rgba(0,240,240,0.06)',
  },
  backButton: {
    position: 'absolute',
    top: 64,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: BORDER_S,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 28,
    paddingBottom: 60,
  },
  label: {
    fontSize: 11,
    letterSpacing: 3,
    color: ACCENT,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 36,
    fontWeight: '600',
    color: TEXT,
    letterSpacing: -1,
    lineHeight: 40,
    marginBottom: 36,
  },
  fieldGroup: {
    marginBottom: 28,
  },
  fieldLabel: {
    fontSize: 11,
    color: TEXT_DIM,
    letterSpacing: 1.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  input: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_INPUT,
    fontSize: 17,
    color: TEXT,
    backgroundColor: 'transparent',
  },
  primaryButton: {
    height: 56,
    borderRadius: 999,
    backgroundColor: ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0B33',
    letterSpacing: -0.2,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 13,
    color: TEXT_MUT,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '600',
    color: ACCENT,
  },
});

export default SignUpScreen;
