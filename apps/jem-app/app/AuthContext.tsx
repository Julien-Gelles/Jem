import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

//Définition du Type du contexte
interface AuthContextType {
  token: string | null;
  //stocke le token dans asyncStorage
  login: (token: string) => Promise<void>;
  //Supprime le token
  logout: () => Promise<void>;
}

//Permet de fournir et consommer le AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);


//AuthProvider : va gérer l'authentification
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    //Au démarrage de l'app : récupère le token depuis AsyncStorage
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem("authToken");
      //Si un token existe, il est stocké
      if (storedToken) setToken(storedToken);
    };
    loadToken();
  }, []);


//Stocke le token et l'enregistre de façon persistante dans AsyncStorage 
  const login = async (newToken: string) => {
    setToken(newToken);
    await AsyncStorage.setItem("authToken", newToken);
  };

//Supprime le token de AsyncStorage (déconnexion)
  const logout = async () => {
    setToken(null);
    await AsyncStorage.removeItem("authToken");
  };

  //AuthContext met à disposition token, login et logout à toute l'app
  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

//Permet d’accéder au contexte facilement (useAuth())
//Vérifie que useAuth() est utilisé dans AuthProvider
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
