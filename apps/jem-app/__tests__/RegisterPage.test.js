import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginPage from "../app/(publicPages)/LoginPage";
import { useRouter } from "expo-router";
import { useAuth } from "../app/AuthContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeBaseProvider } from "native-base";
import RegisterPage from "../app/(publicPages)/RegisterPage";

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

  //TEsts pour la page RegisterPage
  describe("RegisterPage", () => {
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


    //Test si erreur quand les champs sont vides 
    it("affiche une erreur si les champs sont vides", async () => {
        const { getByText, getByRole } = render(
          <NativeBaseProvider initialWindowMetrics={inset}>
            <RegisterPage />
          </NativeBaseProvider>
        );
    
        fireEvent.press(getByRole("button", { name: /sign up/i }));
    
        expect(getByText("All fields are required")).toBeTruthy();
      });


    //Test si erreur quand les mots de passe ne correspondent pas
    it("affiche une erreur si les mots de passe ne correspondent pas", async () => {
    const { getByText, getByRole, getByTestId } = render(
        <NativeBaseProvider initialWindowMetrics={inset}>
        <RegisterPage />
        </NativeBaseProvider>
    );

    const nameInput = getByTestId("nameInput");
    fireEvent.changeText(nameInput, "test");

    const emailInput = getByTestId("emailInput");
    fireEvent.changeText(emailInput, "test@test.com");
    
    const passwordInput = getByTestId("passwordInput");
    fireEvent.changeText(passwordInput, "test");

    const confirmPasswordInput = getByTestId("confirmPasswordInput");
    fireEvent.changeText(confirmPasswordInput, "1234");

    fireEvent.press(getByRole("button", { name: /sign up/i }));

    expect(getByText("Passwords do not match")).toBeTruthy();
    });

    //Test si erreur quand l'email n'a pas un format valide
    it("affiche une erreur si l'email n'est pas valide", async () => {
        const { getByText, getByPlaceholderText, getByRole, getByTestId } = render(
          <NativeBaseProvider initialWindowMetrics={inset}>
            <RegisterPage />
          </NativeBaseProvider>
        );

        const nameInput = getByTestId("nameInput");
        fireEvent.changeText(nameInput, "test");
    
        const emailInput = getByTestId("emailInput");
        fireEvent.changeText(emailInput, "testtestcom");
        
        const passwordInput = getByTestId("passwordInput");
        fireEvent.changeText(passwordInput, "test");
    
        const confirmPasswordInput = getByTestId("confirmPasswordInput");
        fireEvent.changeText(confirmPasswordInput, "test");
    
        fireEvent.press(getByRole("button", { name: /sign up/i }));
    
        expect(getByText("Invalid email format")).toBeTruthy();
      });
    
    //Test si la connexion se fait automatiquement après l'inscription et redirection vers '/'
    it("connecte automatiquement l'utilisateur après son inscription et le redirige vers '/'", async () => {
      const mockToken = "fake-token";
    
      //Simuler une réponse ok de l'API pour l'inscription
      axios.post.mockResolvedValueOnce({ data: {} });
    
      //Simuler une réponse ok de l'API pour la connexion, avec un token
      axios.post.mockResolvedValueOnce({ data: { token: mockToken } });
    
      const { getByRole, getByTestId } = render(
        <NativeBaseProvider initialWindowMetrics={inset}>
          <RegisterPage />
        </NativeBaseProvider>
      );

      const nameInput = getByTestId("nameInput");
      fireEvent.changeText(nameInput, "test");

      const emailInput = getByTestId("emailInput");
      fireEvent.changeText(emailInput, "test@test.com");
      
      const passwordInput = getByTestId("passwordInput");
      fireEvent.changeText(passwordInput, "test");

      const confirmPasswordInput = getByTestId("confirmPasswordInput");
      fireEvent.changeText(confirmPasswordInput, "test");
    
      fireEvent.press(getByRole("button", { name: /sign up/i }));
    
      await waitFor(() => {
        // Vérifier que l'API pour l'inscription a été appelée
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining("/users/create"),
          expect.objectContaining({
            name: "test",
            email: "test@test.com",
            password: "test",
          })
        );
    
        //Vérifier que l'API pour la connexion a été appelée après l'inscription
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining("/login"),
          expect.objectContaining({
            email: "test@test.com",
            password: "test",
          })
        );
    
        //Vérifier que login(token) est appelé
        expect(mockLogin).toHaveBeenCalledWith(mockToken);
    
        //Vérifier que la redirection vers '/' se fait
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });
    
    //Test si erreur quand l'inscription a échoué
    it("affiche une erreur en cas d'échec de l'inscription", async () => {
        axios.post.mockRejectedValueOnce({ response: { data: { message: "User already exists" } } });

        const { getByText, getByRole, getByTestId } = render(
            <NativeBaseProvider initialWindowMetrics={inset}>
            <RegisterPage />
            </NativeBaseProvider>
        );

        const nameInput = getByTestId("nameInput");
        fireEvent.changeText(nameInput, "test");

        const emailInput = getByTestId("emailInput");
        fireEvent.changeText(emailInput, "test@test.com");
        
        const passwordInput = getByTestId("passwordInput");
        fireEvent.changeText(passwordInput, "test");

        const confirmPasswordInput = getByTestId("confirmPasswordInput");
        fireEvent.changeText(confirmPasswordInput, "test");

        fireEvent.press(getByRole("button", { name: /sign up/i }));

        await waitFor(() => expect(getByText("User already exists")).toBeTruthy());
    });

    //Test si redirection vers RegisterPage au clic sur 'sign in !'
    it("redirige vers LoginPage au clic sur Sign in", () => {
        const { getByTestId } = render(
        <NativeBaseProvider initialWindowMetrics={inset}>
            <RegisterPage />
        </NativeBaseProvider>
        );
    
        // Récupérer le lien "Sign in !"
        const signInLink = getByTestId("signinLink");
    
        // Simuler le clic sur "Sign in !"
        fireEvent.press(signInLink);
    
        // Vérifier que router.push a bien été appelé avec "/LoginPage"
        expect(mockPush).toHaveBeenCalledWith("/LoginPage");
    });
  })