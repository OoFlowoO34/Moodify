import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';


const NavBar: React.FC = ({ 
}) => {
  


  return (
    <View style={styles.topContainer}>
      <View style={styles.navBarContainer}>

        <TouchableOpacity onPress={() => router.replace("/(tabs)/param")} style={styles.navButton}>
          <Text style={styles.buttonText}>Paramètres</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/(tabs)/listPage")} style={styles.navButton}>
          <Text style={styles.buttonText}>Liste</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/(tabs)/camera")} style={styles.navButton}>
          <Text style={styles.buttonText}>Caméra</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    backgroundColor: '#00F0F0',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0, 
    zIndex: 100, // Assurez-vous que la NavBar est au-dessus des autres éléments
  },
  navBarContainer: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#00F0F0',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 240, 240, 0.2)',
    zIndex: 20,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    padding: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  }
});

export default NavBar;