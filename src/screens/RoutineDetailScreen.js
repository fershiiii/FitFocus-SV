import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
// Usamos el decodificador optimizado que ya repara tus GIFs en Android
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RoutineDetailScreen({ route, navigation }) {
  const { routineId, routineName } = route.params;
  const [exercises, setExercises] = useState([]);

  // Cada vez que esta pantalla tome el foco, va a jalar los datos frescos del disco
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadRoutineExercises();
    });
    return unsubscribe;
  }, [navigation]);

  const loadRoutineExercises = async () => {
    try {
      const stored = await AsyncStorage.getItem("@user_routines");
      if (stored) {
        const json = JSON.parse(stored);
        const currentRoutine = json.find((r) => r.id === routineId);
        if (currentRoutine && currentRoutine.exercises) {
          setExercises(currentRoutine.exercises);
        }
      }
    } catch (e) {
      console.error("Error sincronizando ejercicios", e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Encabezado con los datos de la rutina */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>📋 {routineName}</Text>
          <Text style={styles.subtitle}>Ejercicios enlazados desde la API</Text>
        </View>

        {/* 💥 NUEVO BOTÓN PERMANENTE: Para añadir más ejercicios en cualquier momento */}
        <TouchableOpacity
          style={styles.headerAddBtn}
          onPress={() =>
            navigation.navigate("ExercisesScreen", {
              addingToRoutineId: routineId,
            })
          }
        >
          <Text style={styles.headerAddBtnText}>➕ Añadir</Text>
        </TouchableOpacity>
      </View>

      {/* Listado de ejercicios inyectados */}
      <FlatList
        data={exercises}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          /* Al tocar el ejercicio, te lleva a ver su guía técnica y sus instrucciones animadas */
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Detail", { exercise: item })}
          >
            {item.gifUrl && (
              <Image source={{ uri: item.gifUrl }} style={styles.thumbnail} />
            )}
            <View style={styles.cardContent}>
              <Text style={styles.exerciseName}>{item.name.toUpperCase()}</Text>
              <Text style={styles.exerciseDesc}>
                🎯 Músculo: {item.target || "N/A"} | 🛠️{" "}
                {item.equipment || "Ninguno"}
              </Text>
            </View>
            <Text style={styles.arrowIcon}>➔</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Esta rutina no contiene ejercicios asignados todavía.
            </Text>
            <TouchableOpacity
              style={styles.addBtnLarge}
              onPress={() =>
                navigation.navigate("ExercisesScreen", {
                  addingToRoutineId: routineId,
                })
              }
            >
              <Text style={styles.addBtnLargeText}>
                🔍 Buscar en la Biblioteca API
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    paddingBottom: 15,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 12, color: "#64748b", marginTop: 2 },
  headerAddBtn: {
    backgroundColor: "#22c55e",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  headerAddBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  card: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  thumbnail: {
    width: 45,
    height: 45,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  cardContent: { marginLeft: 12, flex: 1 },
  exerciseName: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  exerciseDesc: { color: "#94a3b8", fontSize: 11, marginTop: 4 },
  arrowIcon: { color: "#64748b", fontSize: 14, marginRight: 5 },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: {
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 13,
  },
  addBtnLarge: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  addBtnLargeText: { color: "#22c55e", fontWeight: "bold", fontSize: 13 },
});
