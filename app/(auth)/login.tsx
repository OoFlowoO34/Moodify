import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from "react-native";
import { authService } from "@/services/auth/authService";
import { router } from "expo-router";

const LoginScreen = () => {
  const [email, setEmail] = useState("dorian.figueras1207@gmail.com"); // Valeur préremplie
  const [password, setPassword] = useState("password"); // Mot de passe simple pour les tests
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    console.log("Tentative de connexion avec:", email);
    setLoading(true);
    
    try {
      await authService.login(email, password);
      console.log("Connexion réussie");
      
      // Redirection vers l'application principale
      router.replace("/(tabs)/camera");
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
      <Text style={styles.title}>Créer un compte</Text>
      
      
      <Text style={styles.subtitle}>Renseignez votre email</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Text style={styles.subtitle}>Renseignez votre mot de passe</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />
      
      <TouchableOpacity 
        onPress={handleLogin} 
        style={styles.loginButton}
        disabled={loading}
      >
        <Text style={styles.loginText}>
          {loading ? "Connexion en cours..." : "Se connecter"}
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

export default LoginScreen;