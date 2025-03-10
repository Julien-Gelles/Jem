import React, { useState } from 'react';
import { Text, Input, Button, Box, Heading, VStack, FormControl, WarningOutlineIcon } from "native-base";
import { useRouter } from "expo-router";
import axios from 'axios';
import { useAuth } from "../AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

import env from '../../env.json';

const LoginPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  //Permet de stocker le token
  const { login } = useAuth();

  const backUrl = env.BASE_URL;

  const handleSignIn = async () => {
    // Voir si tous les champs sont remplis
    if ( !email || !password) {
      setError("All fields are required");
      return;
    }

    // Réinitialiser l'erreur
    setError("");

    try {
      const response = await axios.post(`${backUrl}:5000/login`, {
        email,
        password
      });

      console.log("login réussi :", response.data);

      const token = response.data.token;
      if (!token) throw new Error("Token not received");
  
      await login(token);

    // TODO : à enlever - Vérifie si le token est bien stocké
    const storedToken = await AsyncStorage.getItem("authToken");
    console.log("Token stocké dans AsyncStorage :", storedToken);

    // Rediriger vers HomePage après le login
     router.push('/');
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

   
  }

  return (
<Box w="100%" h="100%" bg="darkBlue.900" p="12">
     <Heading color="white" m="8" alignSelf="center">JEM SHOP</Heading>
        <Box safeArea p="8" w="90%" maxW="290" py="8" bg="white" rounded="xl" alignSelf="center">
          <Heading size="lg" fontWeight="600" color="coolGray.800" _dark={{
          color: "warmGray.50"
        }}>
            Login
          </Heading>
          <Heading mt="1" _dark={{
          color: "warmGray.200"
        }} color="coolGray.600" fontWeight="medium" size="xs">
          <Text>Don't have an account ? </Text>
          <Text testID="signupLink" color="darkBlue.600" onPress={() => router.push("/RegisterPage")}>Sign up !</Text>
           {/* Affiche le message d'erreur s'il y en a un*/}
            {error ? (
              <Text color="red.500" mt="2" fontWeight="bold">
                {error}
              </Text>
            ) : null}
          </Heading>
  
          <VStack space={3} mt="5">

            <FormControl isInvalid={!email && error}>
                <FormControl.Label>Email</FormControl.Label>
                <Input testID="emailInput" value={email} onChangeText={setEmail} />
                {!email && error ? <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>required field</FormControl.ErrorMessage> : null}
            </FormControl>
            

            <FormControl isInvalid={!password && error}>
              <FormControl.Label>Password</FormControl.Label>
              <Input testID="passwordInput" type="password" value={password} onChangeText={setPassword} />
              {!password && error ? <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>required field</FormControl.ErrorMessage> : null}
            </FormControl>

            <Button mt="2" bg="darkBlue.800" onPress={handleSignIn}>
              Sign in
            </Button>
          </VStack>
        </Box>
      </Box>
  );
};

export default LoginPage;
  
