import { Stack, useRouter, useSegments } from "expo-router";
import { NativeBaseProvider } from "native-base";
import "../global.css";
import React, { useEffect, ReactNode } from "react";
import { AuthProvider, useAuth } from "./AuthContext";

export default function RootLayout() {
  
  return (
    <AuthProvider>
      <ProtectedRoutes>
        <NativeBaseProvider>
          <Stack
              screenOptions={{
                  headerShown: false,
              }}
          />;
        </NativeBaseProvider>
      </ProtectedRoutes>
    </AuthProvider>
  )
}

//Gestion des routes ouvertes sans token
const ProtectedRoutes = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const router = useRouter();
  const segments = useSegments(); // Récupère l'URL actuelle 

  useEffect(() => {
    // Pages accessibles sans token
    const publicPages = "(publicPages)";

    // Redirection si l'utilisateur n'a pas de token et essaie d'accéder à une page privée
    if (!token && !publicPages.includes(segments[0])) {
      router.replace("/LoginPage");
    }
  }, [token, segments]);

  return children;
};
