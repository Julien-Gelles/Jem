import React, { useState } from 'react';
import { Text, Input, Button, Box, Heading, VStack, FormControl, WarningOutlineIcon } from "native-base";
import { useRouter } from "expo-router";
import axios from 'axios';
import { useAuth } from "../AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import env from '../../env.json';

const RegisterPage = () => {
  const router = useRouter();

  const { login } = useAuth();

  const backUrl = env.BASE_URL;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  //regex validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  //Fonction pour que l'utilisateur soit connecté automatiquement après son inscription
  const handleLoginAfterSignUp = async () => {
    try {
      const response = await axios.post(`${backUrl}:5000/login`, { email, password });

      console.log("Login réussi :", response.data);
      const token = response.data.token;
      if (!token) throw new Error("Token not received");

      await AsyncStorage.setItem("authToken", token);
      console.log("Token stocké dans AsyncStorage :", await AsyncStorage.getItem("authToken"));

      await login(token);

      router.push('/');
    } catch (error) {
      console.error('Error during login:', error);
      setError("Login failed after registration. Please try to log in manually.");
    }
  };

  const handleSignUp = async () => {
    // Voir si tous les champs sont remplis
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    // Voir si les mots de passe sont identiques
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Vérifier si l'email est valide
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return;
    }

    // Réinitialiser l'erreur
    setError("");

    try {
      // Appel à l'API pour l'inscription
      const response = await axios.post(`${backUrl}:5000/users/create`, {
        name,
        email,
        password
      });

    // Logique à voir avec le back, pour l'instant console.log
    console.log("Inscription ok :", { name, email, password });
    console.log("Inscription réussie :", response.data);

    // Appel au login après inscription réussie
    await handleLoginAfterSignUp();


  } catch (error) {
    console.error('Error details:', error); 
    if (error.response) {
      setError(error.response.data.message || "Registration failed");
    } else if (error.request) {
      setError("No response was received. Please check your network connection.");
    } else {
      setError("An error occurred: " + error.message);
    }
  }
};

  return (
    <Box w="100%" h="100%" bg="darkBlue.900" p="12" >
      <Heading color="white" m="8" alignSelf="center">JEM SHOP</Heading>
    <Box safeArea p="8" w="90%" maxW="290" py="8" bg="white" rounded="xl" alignSelf="center">
      <Heading size="lg" color="coolGray.800" _dark={{
      color: "warmGray.50"
    }} fontWeight="semibold">
        Register
      </Heading>
       <Heading mt="1" color="coolGray.600" _dark={{
      color: "warmGray.200"
    }} fontWeight="medium" size="xs">
        <Text>Already have an account ? </Text>
        <Text testID="signinLink" color="darkBlue.600" onPress={() => router.push("/LoginPage")}>Sign in !</Text>
         {/* Affiche le message d'erreur s'il y en a un*/}
         {error ? (
          <Text color="red.500" mt="2" fontWeight="bold">
            {error}
          </Text>
        ) : null}
      </Heading> 
      <VStack space={4} mt="5">
        <FormControl isInvalid={!name && error}>
          <FormControl.Label>Name*</FormControl.Label>
          <Input testID='nameInput' value={name} onChangeText={setName} />
          {!name && error ? <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>required field</FormControl.ErrorMessage> : null}
        </FormControl>
    

        <FormControl isInvalid={(!email || !emailRegex.test(email)) && error}>
          <FormControl.Label>Email*</FormControl.Label>
          <Input testID='emailInput' value={email} onChangeText={setEmail} />
          {!email && error ? <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>required field</FormControl.ErrorMessage> : null}
        </FormControl>
      

        <FormControl isInvalid={!password && error}>
          <FormControl.Label>Password*</FormControl.Label>
          <Input testID='passwordInput' type="password" value={password} onChangeText={setPassword} />
          {!password && error ? <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>required field</FormControl.ErrorMessage> : null}
        </FormControl>

        <FormControl isInvalid={!confirmPassword && error}>
          <FormControl.Label>Confirm Password*</FormControl.Label>
          <Input testID='confirmPasswordInput' type="password" value={confirmPassword} onChangeText={setConfirmPassword} />
          {!confirmPassword && error ? <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>required field</FormControl.ErrorMessage> : null}
        </FormControl>
     
       
        <Button mt="2" bg="darkBlue.800" onPress={handleSignUp} >
          Sign up
        </Button>

      </VStack>
    </Box>
  </Box>
  );
};

export default RegisterPage;
