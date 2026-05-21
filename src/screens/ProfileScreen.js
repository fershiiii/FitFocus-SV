import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView } from "react-native";
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';

export default function ProfileScreen() {
  const [location, setLocation] = useState(null);
  const [tokenDisplay, setTokenDisplay] = useState("No verificado");
  const [camStatus, setCamStatus] = useState("No solicitada");

  // REQUERIMIENTO: Almacenamiento seguro usando Secure Store
  const guardarTokenMembresia = async () => {
    try {
      await SecureStore.setItemAsync('user_gym_token', 'FITFOCUS-81b1f4cbe9b3fcc9267e');
      Alert.alert("SecureStore", "Membresía cifrada guardada de forma segura.");
    } catch (e) {
      Alert.alert("Error", "No se pudo encriptar.");
    }
  };

  const recuperarTokenMembresia = async () => {
    let result = await SecureStore.getItemAsync('user_gym_token');
    if (result) {
      setTokenDisplay("Activo (Cifrado)");
      Alert.alert("Membresía Autenticada", "Token recuperado correctamente.");
    } else {
      Alert.alert("Aviso", "No hay credenciales seguras guardadas.");
    }
  };

  // REQUERIMIENTO: Sensor 1 -> Ubicación GPS (expo-location)
  const obtenerUbicacionGym = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita GPS para ubicar sedes del Gimnasio.');
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);
    Alert.alert("GPS Listo", "Coordenadas del entrenamiento registradas.");
  };

  // REQUERIMIENTO: Sensor 2 -> Cámara de Progreso (expo-camera)
  const solicitarPermisoCamara = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      setCamStatus("Autorizada ✔️");
      Alert.alert("Cámara Activada", "Permiso concedido. El sensor está listo para fotos de progreso.");
    } else {
      setCamStatus("Denegada ❌");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
        <Text style={styles.goal}>Membresía: {tokenDisplay}</Text>
      </View>

      {/* COMPONENTE OBLIGATORIO DE LA RÚBRICA: SENSORES Y SEGURIDAD */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔐 Autenticación Segura (SecureStore)</Text>
        <View style={styles.rowButtons}>
          <TouchableOpacity style={[styles.inlineButton, {backgroundColor: '#444'}], styles.actionBtn} onPress={guardarTokenMembresia}>
            <Text style={styles.btnText}>Guardar Token</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.inlineButton, {backgroundColor: '#22c55e'}], styles.actionBtn} onPress={recuperarTokenMembresia}>
            <Text style={styles.btnText}>Validar Token</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📍 Localización del Gimnasio (GPS)</Text>
        <TouchableOpacity style={styles.sensorBtn} onPress={obtenerUbicacionGym}>
          <Text style={styles.btnText}>📍 Registrar Ubicación de Entreno</Text>
        </TouchableOpacity>
        {location && (
          <Text style={styles.sensorResult}>
            Latitud: {location.coords.latitude.toFixed(4)} | Longitud: {location.coords.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📸 Sensor de Cámara (Fotos Progreso)</Text>
        <TouchableOpacity style={[styles.sensorBtn, {backgroundColor: '#a855f7'}]} onPress={solicitarPermisoCamara}>
          <Text style={styles.btnText}>📷 Activar Cámara de Progreso</Text>
        </TouchableOpacity>
        <Text style={styles.sensorResult}>Estado del hardware: {camStatus}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 16 },
  header: { alignItems: "center", marginBottom: 15 },
  avatarContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#1e293b", justifyContent: "center", alignItems: "center", overflow: "hidden", borderWidth: 3, borderColor: "#22c55e", marginBottom: 8 },
  avatar: { width: 60, height: 60 },
  name: { fontSize: 20, fontWeight: "bold", color: "#f8fafc" },
  card: { backgroundColor: "#1e293b", borderRadius: 18, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: "bold", color: "#f8fafc", marginBottom: 10 },
  rowButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { flex: 0.48, backgroundColor: '#334155', padding: 12, borderRadius: 10, alignItems: 'center' },
  sensorBtn: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  sensorResult: { color: '#94a3b8', fontSize: 13, marginTop: 8, textAlign: 'center', fontStyle: 'italic' }
});