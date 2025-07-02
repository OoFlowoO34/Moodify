import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from "react-native";
import { authService } from "@/services/auth/authService";
import { router } from "expo-router";

const ForgottenPasswordScreen = () => {
  const [email, setEmail] = useState("dorian.figueras1207@gmail.com"); // Valeur préremplie
  const [loading, setLoading] = useState(false);

  const handleForgottenPassword = async () => {
    if (!email) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    console.log("Tentative de connexion avec:", email);
    setLoading(true);
    
    try {
      await authService.forgottenPassword(email);
      // Redirection vers l'application principale
      router.replace("/(auth)/login");
    } catch (error: any) {
      console.error(error);
      // Afficher le message d'erreur du backend si disponible
      const errorMessage = error.response?.data?.message || error.message || "Erreur de connexion";
      Alert.alert("Erreur", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mot de passe oublié</Text>
      
      <Text style={styles.subtitle}>Renseignez votre email</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none"
        keyboardType="email-address"
      />
  
      <TouchableOpacity 
        onPress={handleForgottenPassword} 
        style={styles.loginButton}
        disabled={loading}
      >
        <Text style={styles.loginText}>
          {loading ? "Envoie en cours..." : "Envoyer le lien de réinitialisation"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    position: "absolute",
    top: 60, // tu peux ajuster selon la hauteur du status bar
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 30,
    width: "80%",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: "#00F0F0",
    borderRadius: 30,
    paddingVertical: 15,
    width: "80%",
  },
  loginText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },  
    subtitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    width: "80%",
    paddingVertical: 15,
    paddingHorizontal: 20,

  },
});

export default ForgottenPasswordScreen;