// import { useEffect, useState } from 'react';
// import { Redirect, Tabs } from 'expo-router';
// import { authService } from '@/services/auth/authService';
// import { IconSymbol } from '@/components/ui/IconSymbol';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function TabLayout() {
//   const [user, setUser] = useState<string | null>(null);
//   const [initializing, setInitializing] = useState(true);

//   useEffect(() => {
//     AsyncStorage.getItem('user_data').then((data) => {
//       setUser(data);
//       setInitializing(false);
//     });

//   }, []);

//   if (initializing) {
//     return null;
//   }

//   if (!user) {
//     return <Redirect href="/(auth)/login" />;
//   }

//   return (
//     <Tabs screenOptions={{ headerShown: false }}>
//       <Tabs.Screen
//         name="index"
//         options={{
//           tabBarIcon: ({ color }) => (
//             <IconSymbol name="photo" color={color} size={24} />
//           ),
//           tabBarLabel: 'Accueil',
//         }}
//       />
//       <Tabs.Screen
//         name="explore"
//         options={{
//           tabBarIcon: ({ color }) => (
//             <IconSymbol name="magnifyingglass" color={color} size={24} />
//           ),
//           tabBarLabel: 'Explorer',
//         }}
//       />
//       <Tabs.Screen
//         name="listPage"
//         options={{
//           tabBarIcon: ({ color }) => (
//             <IconSymbol name="music.note.list" color={color} size={24} />
//           ),
//           tabBarLabel: 'Playlists',
//         }}
//       />
//       <Tabs.Screen
//         name="camera"
//         options={{
//           tabBarIcon: ({ color }) => (
//             <IconSymbol name="camera" color={color} size={24} />
//           ),
//           tabBarLabel: 'Caméra',
//         }}
//       />
//     </Tabs>
    
//   );
// }