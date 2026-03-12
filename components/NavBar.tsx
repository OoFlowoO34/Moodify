import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';


const NavBar: React.FC = ({ 
}) => {
  


  return (
    <View style={styles.topContainer}>
      <View style={styles.navBarContainer}>

        {/* Bouton paramètres à gauche */}
        <TouchableOpacity  onPress={() => router.push("/(tabs)/param")} style={styles.leftButton}>
          <Text style={styles.buttonText}>Paramètres</Text>
        </TouchableOpacity>

        {/* Conteneur des boutons à droite */}
        <View style={styles.rightContainer}>
          {/* Bouton Liste avec navigation intégrée */}
          <TouchableOpacity onPress={() => router.push("/(tabs)/listPage")} style={styles.rightButton}>
            <Text style={styles.buttonText}>Liste</Text>
          </TouchableOpacity>

          {/* Bouton Caméra avec navigation intégrée */}
          <TouchableOpacity 
          onPress={() => router.push("/(tabs)/camera")}
          style={styles.rightButton}>
            <Text style={styles.buttonText}>Caméra</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#00F0F0',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 240, 240, 0.2)',
    zIndex: 20, // Assurez-vous que la NavBar est au-dessus des autres éléments
  },
  leftButton: {
    padding: 5,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightButton: {
    padding: 5,
    marginLeft: 10, // Espacement entre les boutons à droite
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  }
});

export default NavBar;