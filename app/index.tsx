import { useEffect } from "react";
import { router } from "expo-router";

export default function IndexRedirect() {
  useEffect(() => {
    // Small delay to let the root layout mount before navigating
    const timeout = setTimeout(() => {
      router.replace('/(auth)/entry');
    }, 50);

    return () => clearTimeout(timeout);
  }, []);

  return null;
}