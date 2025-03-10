import React from 'react';
import { Box, Text, VStack, HStack } from 'native-base';

const Products = () => {
  const products = [
    { id: 1, name: 'Product 1', price: 10 },
    { id: 2, name: 'Product 2', price: 20 },
    { id: 3, name: 'Product 3', price: 30 },
    { id: 4, name: 'Product 4', price: 40 },
    { id: 5, name: 'Product 5', price: 50 },
    { id: 6, name: 'Product 6', price: 60 },
    { id: 7, name: 'Product 3', price: 70 },
    { id: 8, name: 'Product 4', price: 80 },
  ];

  const rows = [];
  for (let i = 0; i < products.length; i += 2) {
    rows.push(products.slice(i, i + 2));
  }

  return (
    <VStack space={4} mt={4} px={4}>
      {rows.map((row, rowIndex) => (
        <HStack key={rowIndex} space={4} justifyContent="space-between">
          {row.map((product) => (
            <Box key={product.id} bg="white" borderRadius="md" shadow={2} overflow="hidden" width="48%" height={150} justifyContent="center" alignItems="center">
              <VStack p={4} alignItems="center">
                <Text fontSize="lg" fontWeight="bold">{product.name}</Text>
                <Text fontSize="md" color="gray.700">${product.price}</Text>
              </VStack>
            </Box>
          ))}
        </HStack>
      ))}
    </VStack>
  );
};

export default Products;