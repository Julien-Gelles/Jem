import React from 'react';
import { Box, Text, FlatList, VStack } from 'native-base';

const ProductRecommendation = () => {
  const products = [
    { id: 1, name: 'Product 1', price: 10 },
    { id: 2, name: 'Product 2', price: 20 },
    { id: 3, name: 'Product 3', price: 30 },
    { id: 4, name: 'Product 4', price: 40 },
    { id: 5, name: 'Product 5', price: 50 },
    { id: 6, name: 'Product 6', price: 60 },
  ];

  const renderItem = ({ item }: { item: { id: number; name: string; price: number } }) => (
    <Box bg="white" borderRadius="md" shadow={2} overflow="hidden" m={2} width={150} height={150} justifyContent="center" alignItems="center">
      <VStack p={4} alignItems="center">
        <Text fontSize="lg" fontWeight="bold">{item.name}</Text>
        <Text fontSize="md" color="gray.700">${item.price}</Text>
      </VStack>
    </Box>
  );

  return (
    <Box bg="gray.200" width="100%" py={4}>
        <FlatList
        horizontal
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        />
    </Box>
  );
};

export default ProductRecommendation;