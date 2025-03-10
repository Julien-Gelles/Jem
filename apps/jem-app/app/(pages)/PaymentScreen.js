import PayPal from "expo-paypal";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Navbar from "../../components/Navbar";

const PaymentScreen = ({
   orderDetails = {
       items: [
           { name: "Article 1", price: 18, quantity: 1 },
           { name: "Article 2", price: 8, quantity: 2 },
       ],
       shipping: 5,
       tax: 2,
   },
}) => {
    const router = useRouter();

    const subtotal = orderDetails.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const total = subtotal + orderDetails.shipping + orderDetails.tax;
    const [amount, setAmount] = useState(total);

    const sendPayment = async (startProcess) => {
        if (amount === null) {
            alert("Une erreur est survenue avec le montant");
            return;
        }
        startProcess();
    };

    const OrderSummary = () => (
        <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Récapitulatif de votre commande</Text>

            {orderDetails.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>
                        {item.name} (x{item.quantity})
                    </Text>
                    <Text style={styles.itemPrice}>
                        {(item.price * item.quantity).toFixed(2)} €
                    </Text>
                </View>
            ))}

            <View style={styles.divider} />
            <View style={styles.itemRow}>
                <Text>Sous-total</Text>
                <Text>{subtotal.toFixed(2)} €</Text>
            </View>
            <View style={styles.itemRow}>
                <Text>Livraison</Text>
                <Text>{orderDetails.shipping.toFixed(2)} €</Text>
            </View>
            <View style={styles.itemRow}>
                <Text>TVA</Text>
                <Text>{orderDetails.tax.toFixed(2)} €</Text>
            </View>

            <View style={styles.divider} />
            <View style={styles.totalRow}>
                <Text style={styles.totalText}>Total</Text>
                <Text style={styles.totalAmount}>{total.toFixed(2)} €</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <Navbar bgColor="darkBlue.900"/>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
            >
                <SafeAreaView style={styles.innerSafeArea}>
                    <View style={styles.container}>
                        <OrderSummary />

                        <PayPal
                            sandbox={true}
                            clientId={process.env.PAYPAL_CLIENT_ID}
                            popupContainerStyle={styles.popupContainer}
                            onPress={(startProcess) => {
                                sendPayment(startProcess)
                            }}
                            title="Payer avec PayPal"
                            buttonStyles={styles.button}
                            btnTextStyles={styles.buttonText}
                            amount={amount}
                            success={(response) => {
                                console.log("Paiement réussi:", response);
                                router.push("/SuccessScreen");
                            }}
                            failed={(error) => {
                                console.log("Échec du paiement:", error);
                            }}
                        />
                    </View>
                </SafeAreaView>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    innerSafeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    container: {
        flexGrow: 1,
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    summaryContainer: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "100%",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    itemName: {
        flex: 1,
        marginRight: 10,
    },
    itemPrice: {
        fontWeight: "500",
    },
    divider: {
        height: 1,
        backgroundColor: "#e0e0e0",
        marginVertical: 10,
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    totalText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: "bold",
    },
    popupContainer: {
        height: Dimensions.get("window").height * 1,
        width: Dimensions.get("window").width * 1,
    },
    button: {
        backgroundColor: "#0070BA",
        padding: 10,
        borderRadius: 8,
        width: "100%",
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
});

export default PaymentScreen;
