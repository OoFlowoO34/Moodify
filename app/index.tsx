import { useEffect } from "react";
import { router } from "expo-router";

export default function IndexRedirect() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/(auth)/entry");
    }, 50); // petit délai pour laisser le layout se monter

    return () => clearTimeout(timeout);
  }, []);

  return null;
}