import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ACCENT = '#00F0F0';
const BORDER_S = 'rgba(255,255,255,0.06)';
const TEXT_MUT = 'rgba(255,255,255,0.60)';

type TabId = 'list' | 'cam' | 'user';

interface NavBarProps {
  active?: TabId;
}

const NavBar: React.FC<NavBarProps> = ({ active }) => {
  const pathname = usePathname();

  const getActive = (): TabId => {
    if (active) return active;
    if (pathname.includes('listPage')) return 'list';
    if (pathname.includes('camera')) return 'cam';
    if (pathname.includes('param')) return 'user';
    return 'cam';
  };

  const currentActive = getActive();

  const items: { id: TabId; icon: keyof typeof Ionicons.glyphMap; label: string; route: string }[] = [
    { id: 'list', icon: 'musical-notes', label: 'Playlist', route: '/(tabs)/listPage' },
    { id: 'cam', icon: 'camera', label: 'Capture', route: '/(tabs)/camera' },
    { id: 'user', icon: 'person', label: 'Profil', route: '/(tabs)/param' },
  ];

  return (
    <View style={styles.container}>
      {items.map(item => {
        const isActive = item.id === currentActive;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={isActive ? ACCENT : TEXT_MUT}
            />
            {isActive && <Text style={styles.label}>{item.label}</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 28,
    height: 64,
    borderRadius: 999,
    backgroundColor: 'rgba(26,26,31,0.92)',
    borderWidth: 1,
    borderColor: BORDER_S,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    zIndex: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    gap: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(0,240,240,0.12)',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: ACCENT,
    marginLeft: 4,
  },
});

export default NavBar;
