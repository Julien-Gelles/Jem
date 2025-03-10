import React from "react";
import { Box, Button, VStack, Icon, Heading, Text } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import Navbar from "../components/Navbar";
import { useRouter } from "expo-router";

const Home = () => {
  const router = useRouter();

  return (
    <Box flex={1} bg="darkBlue.900">
      <Navbar />
      <Heading color="white" alignSelf="center" paddingTop={12} fontSize="5xl" fontFamily="serif">
        Jem SHOP
      </Heading>
      <Box flex={1} justifyContent="center" alignItems="center" p="4" mt={-16}>
        <VStack space={4} w="80%">
          <Button
            leftIcon={<Icon as={MaterialIcons} color="black" name="qr-code-scanner" size="lg" />}
            size="lg"
            bg="white"
            height="20"
          >
            <Text fontSize="lg" color="black" fontWeight="bold">Scan a Product</Text>
          </Button>
          <Button
            leftIcon={<Icon as={MaterialIcons} color="black" name="history" size="lg" />}
            onPress={() => router.push("/PurchaseHistory")}
            size="lg"
            bg="white"
            height="20"
          >
            <Text fontSize="lg" color="black" fontWeight="bold">Purchase History</Text>
          </Button>
          <Button
            leftIcon={<Icon as={MaterialIcons} color="black" name="shopping-cart" size="lg" />}
            size="lg"
            bg="white"
            height="20"
          >
            <Text fontSize="lg" color="black" fontWeight="bold">Shopping</Text>
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default Home;