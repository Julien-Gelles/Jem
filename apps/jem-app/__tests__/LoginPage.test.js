import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginPage from "../app/(publicPages)/LoginPage";
import { useRouter } from "expo-router";
import { useAuth } from "../app/AuthContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeBaseProvider } from "native-base";

//Mocker les modules pour isoler le test
jest.mock("expo-router", () => ({
    //remplace le useRouter par jest.fn qui ne fait rien par défaut 
  useRouter: jest.fn(),
}));

jest.mock("../app/AuthContext", () => ({
    //remplace le useAuth par rien par défaut 
  useAuth: jest.fn(),
}));

//Evite les appels réseau rééls () : on l'utilise plus loin pour simuler des appels
jest.mock("axios");

//Pour ne pas écrire et lire rééllement dans le async storage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

//Config de NativeBaseProvider nécessaire (sinon erreurs)
const inset = {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
  };

//Tests pour la page LoginPage
describe("LoginPage", () => {
    //Simulation de la fonction login() de useAuth
    const mockLogin = jest.fn();
    //Simulation de la navigation push de useRouter
    const mockPush = jest.fn();

    //Avant chaque test : 
    //Définit comment useAuth et useRouter doivent se comporter
    beforeEach(() => {
        useAuth.mockReturnValue({ login: mockLogin });
        useRouter.mockReturnValue({ push: mockPush });
        //Réinitialise les mocks (jest.clearAllMocks()) pour éviter les conflits
        jest.clearAllMocks();
  });

  //Test si les champs email, password et le bouton sign in sont bien affichés
  it("Affiche les champs email, password et le bouton sign in", () => {
    const { getByTestId, getByText} = render(
        <NativeBaseProvider initialWindowMetrics={inset}>
            <LoginPage />
        </NativeBaseProvider>
    );

    expect(getByTestId("emailInput")).toBeTruthy();
    expect(getByTestId("passwordInput")).toBeTruthy();
    expect(getByText("Sign in")).toBeTruthy();
  });

  //Test de vérification si les champs sont vides
  it("affiche une erreur si les champs sont vides", async () => {
    //Render : monte le composant LoginPage
    const { getByText, getByRole } = render(
    <NativeBaseProvider initialWindowMetrics={inset}>
        <LoginPage />
    </NativeBaseProvider>);
    
    //fireEvent : simule un clic sur le bouton 
    fireEvent.press(getByRole("button", { name: /sign in/i }));

    //Vérification de l'affichage du message d'erreur (Ici on ne met rien dans les champs)
    expect(getByText("All fields are required")).toBeTruthy();
  });

  //Test si l'utilisateur reçoit un message d'erreur si l'API retourne une erreur.
  it("affiche une erreur si l'authentification échoue", async () => {
   //Simulation d'une réponse d'erreur de l'API
    axios.post.mockRejectedValue({ response: { data: { message: "Invalid credentials" } } });

    const { getByRole, getByText, getByTestId } = render(
    <NativeBaseProvider initialWindowMetrics={inset}>
        <LoginPage />
    </NativeBaseProvider>);

    //Remplit le champ email et password avec des credentials de test
    const emailInput = getByTestId("emailInput");
    fireEvent.changeText(emailInput, "test@test.com");

    const passwordInput = getByTestId("passwordInput");
    fireEvent.changeText(passwordInput, "test");

    fireEvent.press(getByRole("button", { name: /sign in/i }));

    //await waitfor : attend que le message d'erreur s'affiche
    await waitFor(() => expect(getByText("Invalid credentials")).toBeTruthy());
  });

  //Test si l'utilisateur est redirigé quand la connexion est réussie
  it("redirige vers la page d'accueil si le login réussi", async () => {
    //Simule une réponse ok de l'API avec récupération d'un token 
    axios.post.mockResolvedValue({ data: { token: "fake-token" } });

    const { getByRole, getByTestId } = render
    (<NativeBaseProvider initialWindowMetrics={inset}>
        <LoginPage />
    </NativeBaseProvider>);

    const emailInput = getByTestId("emailInput");
    fireEvent.changeText(emailInput, "test@test.com");

    const passwordInput = getByTestId("passwordInput");
    fireEvent.changeText(passwordInput, "test");

    fireEvent.press(getByRole("button", { name: /sign in/i }));

    //attend que login('fake-token') soit appelé (donc user authentifié)
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith("fake-token"));
    //Vérifie que la redirection se fait
    expect(mockPush).toHaveBeenCalledWith("/");
  });

//Test si redirection vers RegisterPage au clic sur 'sign up !'
  it("redirige vers RegisterPage au clic sur Sign up", () => {
    const { getByTestId } = render(
      <NativeBaseProvider initialWindowMetrics={inset}>
        <LoginPage />
      </NativeBaseProvider>
    );

    // Récupérer le lien "Sign up !"
    const signUpLink = getByTestId("signupLink");

    // Simuler le clic sur "Sign up !"
    fireEvent.press(signUpLink);

    // Vérifier que router.push a bien été appelé avec "/RegisterPage"
    expect(mockPush).toHaveBeenCalledWith("/RegisterPage");
  });
});
