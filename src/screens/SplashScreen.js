import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated, Easing } from "react-native";

export default function SplashScreen({ navigation }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => {
      navigation.replace("Home");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      {/* GIF DE FONDO */}
      <Image
        source={require("../../assets/gym-loader.gif")}
        style={styles.backgroundGif}
        resizeMode="cover"
      />

      {/* OVERLAY OSCURO */}
      <View style={styles.overlay} />

      {/* CONTENIDO */}
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>FitFocus SV</Text>
        <Text style={styles.subtitle}>Entrena con enfoque</Text>

        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Cargando...</Text>

          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  backgroundGif: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  logo: {
    width: 70,
    height: 70,
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#ffffff",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#d1d5db",
    marginBottom: 30,
  },

  loadingBox: {
    width: "100%",
    alignItems: "center",
  },

  loadingText: {
    fontSize: 14,
    color: "#e5e7eb",
    marginBottom: 10,
  },

  progressBar: {
    width: "75%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 999,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 999,
  },
});
