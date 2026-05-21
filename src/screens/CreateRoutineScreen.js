import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CreateRoutineScreen({ navigation }) {
  const [routineName, setRoutineName] = useState("");
  const [targetMuscle, setTargetMuscle] = useState("");
  const [selectedDay, setSelectedDay] = useState("Lunes"); // Día por defecto
  const [savedRoutines, setSavedRoutines] = useState([]);

  const daysOfWeek = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadRoutines();
    });
    return unsubscribe;
  }, [navigation]);

  const loadRoutines = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("@user_routines");
      if (jsonValue != null) {
        setSavedRoutines(JSON.parse(jsonValue));
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo leer el historial.");
    }
  };

  const handleSaveRoutine = async () => {
    if (!routineName.trim() || !targetMuscle.trim()) {
      Alert.alert(
        "Campos vacíos",
        "Por favor completa el nombre y el músculo objetivo.",
      );
      return;
    }

    const newRoutine = {
      id: Date.now().toString(),
      name: routineName,
      muscle: targetMuscle,
      day: selectedDay, // 👈 Guardamos el día asignado
      date: new Date().toLocaleDateString(),
      exercises: [],
    };

    try {
      const updatedList = [newRoutine, ...savedRoutines];
      setSavedRoutines(updatedList);
      await AsyncStorage.setItem("@user_routines", JSON.stringify(updatedList));

      setRoutineName("");
      setTargetMuscle("");
      Alert.alert("🎯 Éxito", `Rutina programada para el día ${selectedDay}.`);
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar.");
    }
  };

  const handleClearRoutines = async () => {
    try {
      await AsyncStorage.removeItem("@user_routines");
      setSavedRoutines([]);
      Alert.alert("🗑️ Historial Limpio", "Se borraron las rutinas locales.");
    } catch (e) {
      Alert.alert("Error", "No se pudo limpiar.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✍️ Diseñador de Rutinas</Text>
      <Text style={styles.subtitle}>
        Configura tus entrenamientos y organízalos por día semanal.
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Formulario */}
        <View style={styles.form}>
          <Text style={styles.label}>Nombre de la Rutina:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Hipertrofia Empuje..."
            placeholderTextColor="#64748b"
            value={routineName}
            onChangeText={setRoutineName}
          />

          <Text style={styles.label}>Grupo Muscular Objetivo:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Pecho y Tríceps..."
            placeholderTextColor="#64748b"
            value={targetMuscle}
            onChangeText={setTargetMuscle}
          />

          {/* 🗓️ NUEVO: Selector Estético de Días */}
          <Text style={styles.label}>Asignar Día de la Semana:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.daysScroll}
          >
            {daysOfWeek.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  selectedDay === day && styles.dayButtonActive,
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    selectedDay === day && styles.dayButtonTextActive,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.btnSave} onPress={handleSaveRoutine}>
            <Text style={styles.btnSaveText}>💾 Programar en Calendario</Text>
          </TouchableOpacity>
        </View>

        {/* Historial */}
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>📋 Mis Rutinas Creadas</Text>
            {savedRoutines.length > 0 && (
              <TouchableOpacity onPress={handleClearRoutines}>
                <Text style={styles.btnClear}>Borrar todo</Text>
              </TouchableOpacity>
            )}
          </View>

          {savedRoutines.length === 0 ? (
            <Text style={styles.emptyText}>
              No tienes rutinas creadas todavía.
            </Text>
          ) : (
            savedRoutines.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.routineCard}
                onPress={() =>
                  navigation.navigate("RoutineDetail", {
                    routineId: item.id,
                    routineName: item.name,
                  })
                }
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.routineCardTitle}>{item.name}</Text>
                  <Text style={styles.routineCardMuscle}>
                    💪 Enfoque: {item.muscle}
                  </Text>
                  <Text style={styles.routineDayTag}>🗓️ {item.day}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.routineCardDate}>{item.date}</Text>
                  <Text style={styles.arrowIcon}>➔</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 5 },
  subtitle: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 20,
  },
  form: {
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 20,
  },
  label: {
    color: "#22c55e",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#0f172a",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#334155",
  },
  daysScroll: { flexDirection: "row", marginVertical: 8, marginBottom: 20 },
  dayButton: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  dayButtonActive: { backgroundColor: "#22c55e", borderColor: "#22c55e" },
  dayButtonText: { color: "#94a3b8", fontSize: 12, fontWeight: "600" },
  dayButtonTextActive: { color: "#fff" },
  btnSave: {
    backgroundColor: "#22c55e",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnSaveText: { color: "#fff", fontWeight: "bold" },
  historyContainer: { marginTop: 10, paddingBottom: 30 },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  historyTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  btnClear: { color: "#ef4444", fontSize: 12, fontWeight: "bold" },
  emptyText: {
    color: "#64748b",
    fontSize: 13,
    textAlign: "center",
    marginTop: 20,
  },
  routineCard: {
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  routineCardTitle: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  routineCardMuscle: { color: "#94a3b8", fontSize: 12, marginTop: 2 },
  routineDayTag: {
    color: "#38bdf8",
    fontSize: 11,
    marginTop: 5,
    fontWeight: "bold",
  },
  routineCardDate: { color: "#64748b", fontSize: 11 },
  arrowIcon: { color: "#38bdf8", fontSize: 16, marginTop: 5 },
});
