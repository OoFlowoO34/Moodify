// import { useEffect, useState } from 'react';
// import { Redirect, Stack } from 'expo-router';
// import { authService } from '@/services/auth/authService';

// export default function AuthLayout() {
//   const [user, setUser] = useState(null);
//   const [initializing, setInitializing] = useState(true);

//   useEffect(() => {
//     const checkAuth = async () => {
//       const currentUser = await authService.getCurrentUser();
//       setUser(currentUser);
//       setInitializing(false);
//     };

//     checkAuth();
//   }, []);

//   if (initializing) {
//     return null;
//   }

//   if (user) {
//     return <Redirect href="/(tabs)" />;
//   }

//   return <Stack screenOptions={{ headerShown: false }} />;
// }