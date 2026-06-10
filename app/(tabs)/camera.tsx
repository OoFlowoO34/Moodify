import NavBar from '@/components/NavBar';
import { MOOD_LOGO_SOURCES } from '@/constants/moodLogos';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, TouchableOpacity, View, Image,
  Animated,
} from 'react-native';
import { sendPhoto } from '@/services/mood/moodService';
import {
  getLocalPlaylistByMood,
  resolvePlaylistFromApiResponse,
} from '@/services/mood/localPlaylistService';
import { useMusicContext } from '@/contexts/MusicContext';
import { useFeedback } from '@/contexts/FeedbackContext';
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
  const { setMusicList, setSelectedMood, setIsLoading, setCurrentTrack, playTrack } =
    useMusicContext();
  const { showError } = useFeedback();

  // Pulsing ring animation for the capture button
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
    setIsLoading(true);
    setMusicList([]);
    setCurrentTrack(null);

    const { mood, playlist } = await getLocalPlaylistByMood(humor);
    setSelectedMood(mood);
    setMusicList(playlist);
    if (playlist.length > 0) {
      playTrack(playlist[0]);
    }
    setIsLoading(false);
  }

  async function takePicture() {
    if (!cameraRef.current) return;

    setIsLoading(true);
    setMusicList([]);
    setCurrentTrack(null);
    router.push('/(tabs)/listPage');

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo?.uri) return;

      const apiResponse = await sendPhoto(photo.uri);
      console.log('Raw API response:', apiResponse);
      const { mood, playlist } = await resolvePlaylistFromApiResponse(apiResponse);
      setSelectedMood(mood);
      setMusicList(playlist);
      if (playlist.length > 0) {
        playTrack(playlist[0]);
      }
    } catch {
      showError(new Error('Photo'), 'generic');
    } finally {
      setIsLoading(false);
    }
  }

  async function pickImageFromGallery() {
    setIsLoading(true);
    setCurrentTrack(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        setMusicList([]);
        router.push('/(tabs)/listPage');
        const apiResponse = await sendPhoto(image.uri);
        const { mood, playlist } = await resolvePlaylistFromApiResponse(apiResponse);
        setSelectedMood(mood);
        setMusicList(playlist);
        if (playlist.length > 0) {
          playTrack(playlist[0]);
        }
      }
    } catch {
      showError(new Error('Galerie'), 'generic');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>

        {/* Vignette overlay — reserved for gradient layer if needed */}
        <View style={styles.vignette} pointerEvents="none" />

        {/* Top chrome */}
        <View style={styles.topChrome}>
          <TouchableOpacity style={styles.glassButton} onPress={() => router.back()}>
            <Ionicons name="close" size={20} color={TEXT} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.glassButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={20} color={TEXT} />
          </TouchableOpacity>
        </View>


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
                  { key: 'Happy', label: 'Joyeux', icon: MOOD_LOGO_SOURCES.happy },
                  { key: 'sad', label: 'Mélancolique', icon: MOOD_LOGO_SOURCES.sad },
                  { key: 'neutral', label: 'Serein', icon: MOOD_LOGO_SOURCES.neutral },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.humorItem}
                    onPress={() => handleHumorSelection(item.key)}
                  >
                    <Image source={item.icon} style={styles.humorIcon} resizeMode="contain" />
                    <Text style={styles.humorLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

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
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
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
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: BORDER_S,
    flex: 1,
    minWidth: 0,
  },
  humorIcon: {
    width: 44,
    height: 44,
  },
  humorLabel: {
    fontSize: 10,
    color: TEXT,
    fontWeight: '500',
    textAlign: 'center',
  },
});
