import {
    BarcodeScanningResult,
    CameraView,
    useCameraPermissions,
  } from "expo-camera";
  import { useState, useEffect } from "react";
  import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Button,
    ScrollView,
  } from "react-native";
  import { IconButton, Icon } from "native-base";
  import { MaterialIcons } from "@expo/vector-icons";
  
  const SCREEN_HEIGHT = Dimensions.get("window").height;
  
  const ScanPage = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [isScanning, setIsScanning] = useState(true);
    const [scannedCode, setScannedCode] = useState("");
    const [showPopup, setShowPopup] = useState(false);
  
    useEffect(() => {
      if (!permission) {
        requestPermission();
      }
    }, [permission]);
  
    if (!permission || !permission.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.message}>
            We need your permission to use the camera
          </Text>
          <Button onPress={requestPermission} title="Allow Camera" />
        </View>
      );
    }
  
    const onBarcodeScanned = (result) => {
      if (result.data && isScanning) {
        setIsScanning(false);
        setScannedCode(result.data);
        setShowPopup(true);
        console.log(`Scanned barcode type: ${result.type}, data: ${result.data}`);
        setTimeout(() => {
          setIsScanning(true);
          setShowPopup(false);
        }, 2000); 
      }
    };
  
    return (
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerEnabled={isScanning}
          onBarcodeScanned={onBarcodeScanned}
        >
          <View style={styles.overlay}>
            <View style={styles.scanZone} />
            <Text style={styles.scanText}>
              Place the barcode within the frame
            </Text>
          </View>
        </CameraView>
        {showPopup && (
          <View style={styles.popup}>
            <Text style={styles.popupText}>Barcode scanned!</Text>
          </View>
        )}
        <View style={styles.scannedCodeContainer}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <Text style={styles.scannedCodeText}>{scannedCode}</Text>
          </ScrollView>
          {scannedCode ? (
            <View style={styles.buttonContainer}>
              <IconButton
                icon={<Icon as={MaterialIcons} name="search" size="lg" color="black" />}
                onPress={() => console.log("Search pressed")}
              />
              <Button title="Add to Cart" onPress={() => console.log("Add to Cart pressed")} />
            </View>
          ) : null}
        </View>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    camera: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      backgroundColor: "transparent",
      justifyContent: "center",
      alignItems: "center",
    },
    scanZone: {
      height: 175,
      width: "100%",
      aspectRatio: 2,
      resizeMode: "contain",
      borderWidth: 2,
      borderColor: "white",
      borderRadius: 20,
    },
    scanText: {
      fontSize: 18,
      color: "white",
      textAlign: "center",
      backgroundColor: "rgba(0,0,0,0.7)",
      padding: 20,
      borderRadius: 5,
      marginTop: 20,
    },
    message: {
      textAlign: "center",
      paddingVertical: 20,
      fontSize: 16,
    },
    scannedCodeContainer: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      backgroundColor: "white",
      padding: 10,
      alignItems: "center",
      maxHeight: "30%", 
    },
    scrollViewContent: {
      flexGrow: 1,
      justifyContent: "center",
    },
    scannedCodeText: {
      fontSize: 16,
      color: "black",
      marginBottom: 10,
    },
    buttonContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingHorizontal: 10,
      paddingTop: 10,
    },
    popup: {
      position: "absolute",
      top: "10%", 
      left: "42%",
      transform: [{ translateX: -50 }],
      backgroundColor: "rgba(0,0,0,0.7)",
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
    },
    popupText: {
      color: "white",
      fontSize: 18,
      textAlign: "center",
      marginBottom: 10,
    },
  });
  
  export default ScanPage;