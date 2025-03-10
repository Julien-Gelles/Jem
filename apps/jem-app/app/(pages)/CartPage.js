import React, { useState, useEffect } from 'react';
import { Box, Text, VStack, HStack, IconButton, Icon, Image, Button, Divider } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useRouter } from 'expo-router';
import Navbar from "../../components/Navbar";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [openRow, setOpenRow] = useState(null);
  const [total, setTotal] = useState(0);
  const deliveryFee = 5;
  const router = useRouter();

  useEffect(() => {
    const fetchCartItems = async () => {
      const data = [
        { id: 1, name: 'Item 1', price: 10, description: 'This is item 1', quantity: 1, stock: 5 },
        { id: 2, name: 'Item 2', price: 20, description: 'This is item 2', quantity: 1, stock: 10 },
        { id: 3, name: 'Item 3', price: 30, description: 'This is item 3', quantity: 1, stock: 3 },
      ];
      setCartItems(data);
      calculateTotal(data);
    };

    fetchCartItems();
  }, []);

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(total);
  };

  const increaseQuantity = (id) => {
    const updatedItems = cartItems.map((item) =>
      item.id === id && item.quantity < item.stock ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const decreaseQuantity = (id) => {
    const updatedItems = cartItems.map((item) =>
      item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    );
    setCartItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const addToFavorites = (id) => {
    console.log('Added to favorites', id);
  };

  const removeItem = (id) => {
    const updatedItems = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedItems);
    calculateTotal(updatedItems);
    if (openRow === id) setOpenRow(null);
  };

  const handleRowOpen = (rowKey) => {
    setOpenRow(rowKey);
  };

  const handleRowClose = (rowKey) => {
    if (openRow === rowKey) {
      setOpenRow(null);
    }
  };

  return (
    <Box flex={1} p={4} bg="darkBlue.800">
      <Navbar />
      <SwipeListView
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Box bg="white" borderRadius="md" my={2} shadow={2} overflow="hidden" h={150}>
            <HStack alignItems="center" p={4}>
              <Image source={{ uri: item.image }} alt={item.name} size="xl" borderRadius="md" />
              <VStack flex={1} ml={4}>
                <Text color="black" fontSize="lg" fontWeight="bold">{item.name}</Text>
                <Text color="gray.700" fontSize="md">${item.price}</Text>
                <Text color="gray.500" fontSize="sm">{item.description}</Text>
                <Text color="gray.500" fontSize="sm">Quantity: {item.quantity}</Text>
                <Text color="gray.500" fontSize="sm">Stock: {item.stock}</Text>
              </VStack>
              <Icon as={MaterialIcons} name="chevron-right" size="lg" color="gray.500" ml="auto" />
            </HStack>
          </Box>
        )}
        renderHiddenItem={({ item }) => (
          <HStack
            flex={1}
            justifyContent="flex-end"
            alignItems="center"
            pr={4}
            h="100%"
          >
            <Box>
              <HStack space={2} alignItems="center">
                <IconButton
                  icon={<Icon as={MaterialIcons} name="remove" size="lg" color="white" />}
                  bg="blue.500"
                  onPress={() => decreaseQuantity(item.id)}
                />
                <IconButton
                  icon={<Icon as={MaterialIcons} name="add" size="lg" color="white" />}
                  bg="green.500"
                  onPress={() => increaseQuantity(item.id)}
                />
              </HStack>
              <HStack space={2} alignItems="center" mt={2}>
                <IconButton
                  icon={<Icon as={MaterialIcons} name="favorite" size="lg" color="white" />}
                  bg="red.500"
                  onPress={() => addToFavorites(item.id)}
                />
                <IconButton
                  icon={<Icon as={MaterialIcons} name="delete" size="lg" color="white" />}
                  bg="gray.800"
                  onPress={() => removeItem(item.id)}
                />
              </HStack>
            </Box>
          </HStack>
        )}
        disableRightSwipe={true}
        leftOpenValue={150}
        stopLeftSwipe={150}
        rightOpenValue={-150}
        onRowOpen={handleRowOpen}
        onRowClose={handleRowClose}
        closeOnRowPress={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        onRowDidOpen={(rowKey) => handleRowOpen(rowKey)}
      />
      <Box bg="gray.300" borderRadius="md" p={4} mt={4}>
        <Box bg="white" p={4} borderRadius="md">
          <Text fontSize="lg" fontWeight="bold">Order Summary</Text>
          <HStack justifyContent="space-between" mt={2}>
            <Text>Total Products:</Text>
            <Text>${total.toFixed(2)}</Text>
          </HStack>
          <HStack justifyContent="space-between" mt={2}>
            <Text>Delivery Fee:</Text>
            <Text>${deliveryFee.toFixed(2)}</Text>
          </HStack>
          <Divider my={2} bg="gray.200" />
          <HStack justifyContent="space-between" mt={2} fontWeight="bold">
            <Text fontWeight="bold">Total:</Text>
            <Text fontWeight="bold">${(total + deliveryFee).toFixed(2)}</Text>
          </HStack>
        </Box>
        <Button bg="darkBlue.700" colorScheme="teal" onPress={() => router.push("/PaymentScreen")} mx="auto" mt={4}>
          Proceed to Payment
        </Button>
      </Box>
    </Box>
  );
};

export default CartPage;