import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput,Image } from "react-native";
import { router } from "expo-router";
import { authService } from "@/services/auth/authService";

const EntryScreen = () => {

  return (
    <View style={styles.container}>
      <Image 
        source={require('@/assets/images/sign-logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text style={styles.title}>Moodify</Text>

      <TouchableOpacity 
        onPress={() => router.push("/(auth)/signup")}
        style={styles.loginButton}
      >

      <Text style={styles.loginText}>
        Créer un compte
      </Text>

      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/(auth)/forgottenPassword")}>
        <Text style={styles.smallWhiteText}>Mot de passe oublié?</Text>
      </TouchableOpacity>    
      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <Text style={styles.whiteText}>Login</Text>
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
    fontSize: 32,
    fontWeight: "bold",
    color: "#00F0F0",
    marginBottom: 40,
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
  whiteText: {
    fontFamily: "roboto",
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  smallWhiteText: {
    fontFamily: "roboto",
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
  },
  logo: {
    position: "absolute",
    top: 40, // tu peux ajuster selon la hauteur du status bar
    alignSelf: "center",

    resizeMode: "contain",
  },
  
});

export default EntryScreen;