import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Navbar from "../components/Navbar";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../app/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeBaseProvider, extendTheme } from "native-base";

// Mocker StatusBar pour éviter les erreurs
jest.mock('react-native/Libraries/Components/StatusBar/StatusBar', () => 'MockedStatusBar');

//Mocker les modules pour isoler le test
jest.mock("expo-router", () => ({
    //remplace le useRouter par jest.fn qui ne fait rien par défaut 
  useRouter: jest.fn(),
  useSegments: jest.fn(),
}));

jest.mock("../app/AuthContext", () => ({
    //remplace le useAuth par rien par défaut 
  useAuth: jest.fn(),
}));

//Pour regler le problème d'icon de NativeBase
jest.mock("react-native-vector-icons", () => ({
    Ionicons: jest.fn(),
    MaterialIcons: jest.fn(),
    FontAwesome: jest.fn(),
  }));

//Pour ne pas écrire et lire rééllement dans le async storage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

//Config de NativeBaseProvider nécessaire (sinon erreurs)
const inset = {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
  };

//Tests pour le composant Navbar
describe("Navbar", () => {
    const mockPush = jest.fn();
    const mockLogout = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({ push: mockPush });
    // Simule qu'on est sur la page Home
    useSegments.mockReturnValue([]);
    useAuth.mockReturnValue({ token: "fake-token", logout: mockLogout });

    jest.clearAllMocks();
  });

    //Test si deconnexion et redirection vers LoginPage
    it("déconnecte l'utilisateur et redirige vers LoginPage", async () => {
        const { getByTestId, getByText } = render(
        <NativeBaseProvider initialWindowMetrics={inset}>
            <Navbar />
        </NativeBaseProvider>
        );

        //Ouvrir le menu utilisateur
        fireEvent.press(getByTestId("userMenu"));

        //Clic sur Logout
        fireEvent.press(getByText("Logout"));

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled();
            expect(mockPush).toHaveBeenCalledWith("/LoginPage");
        });

        //Vérifier que le token est supprimé
        await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalledWith("authToken"));
    });
})