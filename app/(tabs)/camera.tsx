import NavBar from '@/components/NavBar';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import {
  Button, StyleSheet, Text, TouchableOpacity, View, Alert, Image,
  Animated,
} from 'react-native';
import { formatPlaylistResponse, getMusicListByMood, sendPhoto } from "@/services/mood/moodService";
import { useMusicContext } from '@/contexts/MusicContext';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const ACCENT = '#00F0F0';
const BG = '#0D0D0F';
const BORDER_S = 'rgba(255,255,255,0.06)';
const BORDER_ACCENT = 'rgba(0,240,240,0.16)';
const TEXT = '#FAFAFA';
const SURF = 'rgba(0,0,0,0.50)';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [showHumor, setShowHumor] = useState(false);
  const [humorSelected, setHumorSelected] = useState('');
  const cameraRef = useRef<CameraView>(null);
  const { setMusicList, setSelectedMood, setIsLoading } = useMusicContext();

  // Breathing animation for capture ring
  const breathAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const breathScale = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] });
  const breathOpacity = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permContainer}>
        <Text style={styles.permText}>Autorisation caméra requise</Text>
        <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>Autoriser</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function handleHumorSelection(humor: string) {
    router.push('/(tabs)/listPage');
    setHumorSelected(humor);
    setShowHumor(false);
    setSelectedMood(humor);
    setIsLoading(true);
    setMusicList([]);
    try {
      const musicListByMood = await getMusicListByMood(humor);
      const formattedResponse = formatPlaylistResponse(musicListByMood);
      setSelectedMood(formattedResponse.humor ?? humor);
      setMusicList(formattedResponse.playlist);
    } catch (error) {
      setMusicList([]);
      Alert.alert('Erreur', 'Impossible de charger la musique');
    } finally {
      setIsLoading(false);
    }
  }

  async function takePicture() {
    setIsLoading(true);
    router.push('/(tabs)/listPage');
    setMusicList([]);
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: true });
        if (photo) {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status === 'granted') {
            const asset = await MediaLibrary.createAssetAsync(photo.uri);
            await MediaLibrary.createAlbumAsync('Moodify', asset, false);
          }
          const musicListByPicture = await sendPhoto(photo.uri);
          const formattedResponse = formatPlaylistResponse(musicListByPicture);
          setSelectedMood(formattedResponse.humor || "neutral");
          setMusicList(formattedResponse.playlist);
          setIsLoading(false);
        }
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de prendre la photo');
      }
    }
  }

  async function pickImageFromGallery() {
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        setMusicList([]);
        router.push('/(tabs)/listPage');
        const musicListByPicture = await sendPhoto(image.uri);
        const formattedResponse = formatPlaylistResponse(musicListByPicture);
        setSelectedMood(formattedResponse.humor || "neutral");
        setMusicList(formattedResponse.playlist);
        setIsLoading(false);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner la photo');
    }
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>

        {/* Vignette overlay */}
        <View style={styles.vignette} pointerEvents="none" />

        {/* Top chrome */}
        <View style={styles.topChrome}>
          <TouchableOpacity style={styles.glassButton} onPress={() => router.back()}>
            <Ionicons name="close" size={20} color={TEXT} />
          </TouchableOpacity>

          <View style={styles.statusChip}>
            <Text style={styles.statusChipText}>FACE · DÉTECTÉ</Text>
          </View>

          <TouchableOpacity style={styles.glassButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={20} color={TEXT} />
          </TouchableOpacity>
        </View>

        {/* Framing corners */}
        <View style={styles.framingArea} pointerEvents="none">
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        {/* Instructional text */}
        <Text style={styles.instructionText}>Regarde l'objectif.</Text>

        {/* Humor modal */}
        {showHumor && (
          <TouchableOpacity
            style={styles.humorOverlay}
            activeOpacity={1}
            onPress={() => setShowHumor(false)}
          >
            <TouchableOpacity
              style={styles.humorModal}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowHumor(false)}>
                <Ionicons name="close" size={16} color={TEXT} />
              </TouchableOpacity>
              <Text style={styles.humorTitle}>Sélectionnez votre humeur</Text>
              <View style={styles.humorGrid}>
                {[
                  { key: 'Happy', label: 'Joyeux', icon: 'sunny' as const },
                  { key: 'sad', label: 'Mélancolique', icon: 'rainy' as const },
                  { key: 'neutral', label: 'Serein', icon: 'partly-sunny' as const },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.humorItem}
                    onPress={() => handleHumorSelection(item.key)}
                  >
                    <Ionicons name={item.icon} size={28} color={ACCENT} />
                    <Text style={styles.humorLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Bottom controls area */}
        {/* Gallery button (left) */}
        <TouchableOpacity style={styles.sideButton} onPress={pickImageFromGallery}>
          <Ionicons name="images" size={22} color={TEXT} />
        </TouchableOpacity>

        {/* Capture button (center) with breathing ring */}
        <View style={styles.captureWrapper}>
          <Animated.View style={[
            styles.breathRing,
            { transform: [{ scale: breathScale }], opacity: breathOpacity },
          ]} />
          <View style={styles.innerRing} />
          <TouchableOpacity style={styles.captureButton} onPress={takePicture} activeOpacity={0.9} />
        </View>

        {/* Mood selector button (right) */}
        <TouchableOpacity style={[styles.sideButton, styles.sideButtonRight]} onPress={() => setShowHumor(true)}>
          <Ionicons name="happy" size={22} color={ACCENT} />
        </TouchableOpacity>

        {/* Bottom floating nav */}
        <NavBar active="cam" />

      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  camera: {
    flex: 1,
  },
  permContainer: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  permText: {
    color: TEXT,
    fontSize: 16,
    textAlign: 'center',
  },
  permButton: {
    height: 52,
    paddingHorizontal: 32,
    borderRadius: 999,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permButtonText: {
    color: '#0A0B33',
    fontWeight: '600',
    fontSize: 15,
  },
  // Overlay
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  // Top chrome
  topChrome: {
    position: 'absolute',
    top: 64,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  glassButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: SURF,
    borderWidth: 1,
    borderColor: BORDER_S,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: SURF,
    borderWidth: 1,
    borderColor: BORDER_S,
  },
  statusChipText: {
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
  },
  // Framing corners
  framingArea: {
    position: 'absolute',
    top: 160,
    left: 48,
    right: 48,
    bottom: 270,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: ACCENT,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  // Instructional text
  instructionText: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 250,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '400',
    color: TEXT,
    letterSpacing: -0.3,
  },
  // Capture button
  captureWrapper: {
    position: 'absolute',
    bottom: 125,
    left: '50%',
    marginLeft: -38,
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: ACCENT,
  },
  innerRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: ACCENT,
    opacity: 0.7,
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: TEXT,
    borderWidth: 4,
    borderColor: BG,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  // Side buttons
  sideButton: {
    position: 'absolute',
    bottom: 140,
    left: 44,
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: SURF,
    borderWidth: 1,
    borderColor: BORDER_S,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideButtonRight: {
    left: undefined,
    right: 44,
  },
  // Humor modal
  humorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  humorModal: {
    backgroundColor: 'rgba(26,26,31,0.97)',
    borderRadius: 24,
    padding: 28,
    margin: 24,
    borderWidth: 1,
    borderColor: BORDER_ACCENT,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  closeButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  humorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  humorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  humorItem: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: BORDER_S,
    flex: 1,
  },
  humorLabel: {
    fontSize: 11,
    color: TEXT,
    fontWeight: '500',
    textAlign: 'center',
  },
});
