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

const ForgottenPasswordScreen = () => {
  const { showError, showSuccess } = useFeedback();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgottenPassword = async () => {
    if (!email) {
      showError(
        new UserFacingError("Email requis", "Veuillez renseigner votre adresse email.")
      );
      return;
    }

    setLoading(true);
    try {
      await authService.forgottenPassword(email);
      showSuccess(
        "Email envoyé",
        "Si un compte existe, vous recevrez un lien de réinitialisation."
      );
      setTimeout(() => router.replace("/(auth)/login"), 1200);
    } catch (error) {
      showError(error, "auth_forgot_password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topGlow} />

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color={TEXT} />
      </TouchableOpacity>

      <View style={styles.formContainer}>
        <Text style={styles.label}>RÉCUPÉRATION</Text>
        <Text style={styles.heading}>Mot de passe{'\n'}oublié?</Text>
        <Text style={styles.description}>
          Renseignez votre adresse email et nous vous enverrons un lien de réinitialisation.
        </Text>

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

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleForgottenPassword}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Envoi…" : "Envoyer le lien"}
          </Text>
          {!loading && <Ionicons name="mail" size={18} color="#0A0B33" />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Retour à la connexion</Text>
        </TouchableOpacity>
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
    lineHeight: 42,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: TEXT_MUT,
    lineHeight: 22,
    marginBottom: 36,
  },
  fieldGroup: {
    marginBottom: 32,
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
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0B33',
    letterSpacing: -0.2,
  },
  backLink: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  backLinkText: {
    fontSize: 13,
    color: TEXT_MUT,
  },
});

export default ForgottenPasswordScreen;
