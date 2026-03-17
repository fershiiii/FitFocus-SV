import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Perfil del usuario</Text>
        <Text style={styles.text}>Nombre: Usuario FitFocus</Text>
        <Text style={styles.text}>Objetivo: Mejorar condición física</Text>
        <Text style={styles.text}>Meta diaria: 30 minutos de ejercicio</Text>
        <Text style={styles.text}>Ubicación: El Salvador</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Configuración</Text>
        <Text style={styles.text}>- Editar perfil</Text>
        <Text style={styles.text}>- Meta personal</Text>
        <Text style={styles.text}>- Cerrar sesión</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 8,
  },
});
