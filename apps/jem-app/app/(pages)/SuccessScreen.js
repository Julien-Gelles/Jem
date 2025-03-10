import React from "react";
import { View, Text, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";

export default function SuccessScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <LottieView
                source={require("../../assets/blue_success.json")}
                autoPlay
                loop={false}
                style={styles.animation}
            />

            <Text style={styles.title}>Paiement réussi !</Text>
            <Text style={styles.subtitle}>
                Merci pour votre achat. Votre commande a été validée.
            </Text>

            <Button
                mode="contained"
                onPress={() => router.push("/")}
                style={styles.button}
            >
                Retourner à l'accueil
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        paddingHorizontal: 20,
    },
    animation: {
        width: 200,
        height: 200,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#012169",
        marginTop: 20,
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        color: "#009cde",
        marginTop: 10,
    },
    button: {
        marginTop: 30,
        backgroundColor: "#003087",
    },
});
