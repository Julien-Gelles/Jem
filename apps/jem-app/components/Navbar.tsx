import React from "react";
import { HStack, IconButton, Icon, Heading, Spacer, Menu, Pressable, Image } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";

import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../app/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Navbar = ({bgColor = "transparent" }) => {
  const router = useRouter();
  const segments = useSegments();

  const isCartPage = segments.includes("CartPage");
  const isHomePage = segments.length == 0;

  const { token, logout } = useAuth();



  return (
    <HStack justifyContent="space-between" alignItems="center" p="1" bg={bgColor}>
        {!isHomePage && (
            <IconButton
                position="absolute"
                icon={<Icon as={MaterialIcons} name="arrow-back" size="lg" color="white" />}
                onPress={() => router.back()}
            />
        )}
        <Spacer />
        <Pressable
            onPress={() => router.push("/")} // Redirects to Home when clicked
            position="absolute"
            left="50%"
            transform={[{ translateX: -50 }]} // Centers the logo
        >
        <Image
            source={require("../assets/jem_logo.png")} // Replace with your PNG path
            alt="Jem Logo"
            width={100}
            height={45}
            resizeMode="contain"
        />
        </Pressable>
        <Spacer />
        <HStack space={2}>
        <Menu
          w="190"
          trigger={(triggerProps) => {
            return (
              <Pressable {...triggerProps} alignItems="center" justifyContent="center" testID="userMenu">
                <Icon as={MaterialIcons} name="person" size="lg" color="white" />
              </Pressable>
            );
          }}
        >
          <Menu.Item onPress={() => console.log("Modifier mon compte")}>Update my profile</Menu.Item>
          <Menu.Item onPress={async () => {
            await logout();
    
            // TODO : à enlever quand ok : Vérification du token après suppression
            const storedToken = await AsyncStorage.getItem("authToken");
            console.log("Token après déconnexion :", storedToken); 

            router.push("/LoginPage")}}
            >Logout</Menu.Item>
        </Menu>
      {!isCartPage && (
        <IconButton
          icon={<Icon as={MaterialIcons} name="shopping-cart" size="lg" color="white" />}
          onPress={() => router.push("/CartPage")}
        />
      )}
      </HStack>
    </HStack>
  );
};

export default Navbar;