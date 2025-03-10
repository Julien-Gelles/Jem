import React from "react";
import { ScrollView } from "react-native";
import { Box, Heading, VStack, Text, HStack } from "native-base";

const PurchaseHistory = () => {
  return (
    <Box w="100%" h="100%" bg="white" p="4">
      <Heading m="4" alignSelf="center">
        JEM SHOP
      </Heading>
      <ScrollView>
        <VStack space={4} px="4">
          {[...Array(5)].map((_, index) => (
            <Box key={index} w="100%">
              <Text alignSelf="flex-end" fontWeight="bold" fontSize="lg" mb="1">
                2024-10-01
              </Text>
              <Box w="100%" h="32" bg="white" shadow={2} rounded="lg" p="4">
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontWeight="normal" fontSize="sm">
                    Order #{6876435464 + index} | 6 items
                  </Text>
                </HStack>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  mt="2"
                >
                  {[...Array(6)].map((_, itemIndex) => (
                    <Box key={itemIndex} w="20" h="20" bg="gray.200" mr="2" />
                  ))}
                </ScrollView>
              </Box>
            </Box>
          ))}
        </VStack>
      </ScrollView>
    </Box>
  );
};

export default PurchaseHistory;