import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      {/* HEADER PERFIL */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={require("../../assets/avatar.jpg")}
            style={styles.avatar}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.name}>Usuario FitFocus</Text>
        <Text style={styles.goal}>Mejorando cada día 💪</Text>
      </View>

      {/* INFO */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información</Text>

        <Text style={styles.text}>
          <Text style={styles.label}>Objetivo:</Text> Mejorar condición física
        </Text>

        <Text style={styles.text}>
          <Text style={styles.label}>Meta diaria:</Text> 30 min de ejercicio
        </Text>

        <Text style={styles.text}>
          <Text style={styles.label}>Ubicación:</Text> El Salvador
        </Text>
      </View>

      {/* CONFIGURACIÓN */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Configuración</Text>

        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Editar perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Meta personal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.option, styles.logout]}>
          <Text style={[styles.optionText, styles.logoutText]}>
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 16,
  },

  header: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#22c55e",
    marginBottom: 10,
  },

  avatar: {
    width: 70,
    height: 70,
  },

  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f8fafc",
  },

  goal: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 12,
  },

  text: {
    fontSize: 15,
    color: "#cbd5e1",
    marginBottom: 8,
  },

  label: {
    color: "#22c55e",
    fontWeight: "bold",
  },

  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },

  optionText: {
    fontSize: 16,
    color: "#e2e8f0",
  },

  logout: {
    borderBottomWidth: 0,
    marginTop: 6,
  },

  logoutText: {
    color: "#ef4444",
    fontWeight: "bold",
  },
});
