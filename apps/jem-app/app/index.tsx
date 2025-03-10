import React, { useRef } from "react";
import { Box, Button, VStack, Icon, Heading, Text, IconButton, ScrollView as NBScrollView } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import Navbar from "../components/Navbar";
import ProductRecommendation from "../components/ProductRecommendation";
import Products from "../components/Products";
import { useRouter } from "expo-router";
import { ScrollView as RNScrollView, Dimensions } from "react-native";

const { height } = Dimensions.get("window");

const Home = () => {
  const router = useRouter();
  const scrollViewRef = useRef<RNScrollView>(null);
  const recommendationRef = useRef<any>(null);

  const scrollToRecommendations = () => {
    if (recommendationRef.current && scrollViewRef.current) {
      recommendationRef.current.measureLayout(
        scrollViewRef.current,
        (x: number, y: number) => {
          scrollViewRef.current?.scrollTo({ y, animated: true });
        },
        () => {
          console.error("Failed to measure layout");
        }
      );
    }
  };

  return (
    <NBScrollView ref={scrollViewRef} flex={1} bg="darkBlue.900">
      <Navbar />
      <Heading color="white" alignSelf="center" paddingTop={16} fontSize="5xl" fontFamily="serif">
        Jem SHOP
      </Heading>
      <Text fontSize="lg" color="white" textAlign="center" mt={2} mb={2}>
        Welcome back Douchka 😊
      </Text>
      <Box height={height * 0.6} justifyContent="center" alignItems="center">
        <VStack space={4} w="80%" alignItems="center">
          <Button
            leftIcon={<Icon as={MaterialIcons} color="black" name="qr-code-scanner" size="lg" />}
            size="lg"
            bg="white"
            height="20"
            onPress={() => router.push("../(pages)/ScanPage")}
            w="full"
          >
            <Text fontSize="lg" color="black" fontWeight="bold">Scan a Product</Text>
          </Button>
          <Button
            leftIcon={<Icon as={MaterialIcons} color="black" name="history" size="lg" />}
            onPress={() => router.push("/PurchaseHistory")}
            size="lg"
            bg="white"
            height="20"
            w="full"
          >
            <Text fontSize="lg" color="black" fontWeight="bold">Purchase History</Text>
          </Button>
        </VStack>
        <IconButton
          icon={<Icon as={MaterialIcons} name="keyboard-arrow-down" size="4xl" color="white" />}
          onPress={scrollToRecommendations}
          mt={6}
        />
      </Box>

      <Box ref={recommendationRef} mt={40} mb={4}>
        <Text fontSize="xl" fontWeight="bold" color="white" mb={4} mt={10}>
          Your Recommendations
        </Text>
        <ProductRecommendation />
        <Text fontSize="md" color="white" textAlign="center" mt={10} mb={4}>
          All the products
        </Text>
        <Products />
      </Box>
    </NBScrollView>
  );
};

export default Home;