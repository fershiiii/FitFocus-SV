import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen({ navigation }) {
  const daysOfWeek = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  // Obtener el nombre del día de hoy formateado en español con la primera letra en mayúscula
  const getTodayString = () => {
    const options = { weekday: "long" };
    const day = new Intl.DateTimeFormat("es-ES", options).format(new Date());
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const [selectedWidgetDay, setSelectedWidgetDay] = useState(getTodayString());
  const [routines, setRoutines] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadRoutines();
    });
    return unsubscribe;
  }, [navigation]);

  const loadRoutines = async () => {
    try {
      const stored = await AsyncStorage.getItem("@user_routines");
      if (stored) {
        setRoutines(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Buscamos si hay alguna rutina agendada para el día seleccionado en el widget
  const activeRoutineForDay = routines.find((r) => r.day === selectedWidgetDay);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcomeText}>¡Hola de nuevo! 👋</Text>
      <Text style={styles.hubTitle}>Resumen Semanal</Text>

      {/* 🗓️ WIDGET DE AGENDA SEMANAL */}
      <View style={styles.widgetContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.widgetDaysRow}
        >
          {daysOfWeek.map((day) => {
            const isToday = day === getTodayString();
            const isSelected = day === selectedWidgetDay;

            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.widgetDayBox,
                  isSelected && styles.widgetDayBoxSelected,
                  isToday && !isSelected && { borderColor: "#22c55e" },
                ]}
                onPress={() => setSelectedWidgetDay(day)}
              >
                <Text
                  style={[
                    styles.widgetDayLetter,
                    isSelected && styles.widgetDayLetterSelected,
                  ]}
                >
                  {day.substring(0, 2)}
                </Text>
                {isToday && <View style={styles.todayDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Detalle interno del Widget */}
        <View style={styles.widgetBody}>
          <Text style={styles.widgetBodyTitle}>
            Entrenamiento del {selectedWidgetDay}:
          </Text>

          {activeRoutineForDay ? (
            <TouchableOpacity
              style={styles.activeRoutineCard}
              onPress={() =>
                navigation.navigate("RoutineDetail", {
                  routineId: activeRoutineForDay.id,
                  routineName: activeRoutineForDay.name,
                })
              }
            >
              <View>
                <Text style={styles.activeRoutineName}>
                  {activeRoutineForDay.name}
                </Text>
                <Text style={styles.activeRoutineMuscle}>
                  💪 Enfoque: {activeRoutineForDay.muscle}
                </Text>
              </View>
              <Text style={styles.activeRoutineCount}>
                🏋️{" "}
                {activeRoutineForDay.exercises
                  ? activeRoutineForDay.exercises.length
                  : 0}{" "}
                Ejercicios ➔
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.noRoutineBox}>
              <Text style={styles.noRoutineText}>
                ☕ Descanso programado o sin asignar.
              </Text>
              <TouchableOpacity
                style={styles.widgetSetupBtn}
                onPress={() => navigation.navigate("CreateRoutine")}
              >
                <Text style={styles.widgetSetupBtnText}>🗓️ Programar Día</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* TUS OTROS BOTONES Y SECCIONES DEL HUB (Biblioteca, Dieta, etc.) VAN AQUÍ ABAJO */}
      <Text style={styles.sectionTitle}>Secciones de FitFocus</Text>

      <TouchableOpacity
        style={styles.menuBtn}
        onPress={() => navigation.navigate("CreateRoutine")}
      >
        <Text style={styles.menuBtnText}>✍️ Diseñador de Entrenamientos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuBtn, { borderColor: "#38bdf8" }]}
        onPress={() => navigation.navigate("ExercisesScreen")}
      >
        <Text style={[styles.menuBtnText, { color: "#38bdf8" }]}>
          🏋️ Abrir Biblioteca API
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 20 },
  welcomeText: { color: "#64748b", fontSize: 14, fontWeight: "600" },
  hubTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },

  // Estilos del Widget
  widgetContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 25,
  },
  widgetDaysRow: { paddingVertical: 5 },
  widgetDayBox: {
    width: 42,
    height: 45,
    backgroundColor: "#0f172a",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#334155",
    position: "relative",
  },
  widgetDayBoxSelected: { backgroundColor: "#22c55e", borderColor: "#22c55e" },
  widgetDayLetter: { color: "#94a3b8", fontSize: 12, fontWeight: "bold" },
  widgetDayLetterSelected: { color: "#fff" },
  todayDot: {
    width: 5,
    height: 5,
    backgroundColor: "#22c55e",
    borderRadius: 2.5,
    position: "absolute",
    bottom: 4,
  },

  widgetBody: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    paddingTop: 15,
  },
  widgetBodyTitle: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
  },

  activeRoutineCard: {
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  activeRoutineName: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  activeRoutineMuscle: { color: "#94a3b8", fontSize: 11, marginTop: 2 },
  activeRoutineCount: { color: "#22c55e", fontSize: 12, fontWeight: "bold" },

  noRoutineBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  noRoutineText: { color: "#64748b", fontSize: 12, fontStyle: "italic" },
  widgetSetupBtn: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#38bdf8",
  },
  widgetSetupBtnText: { color: "#38bdf8", fontSize: 11, fontWeight: "bold" },

  // Estilos base de los botones del menú viejo
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 15,
  },
  menuBtn: {
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#22c55e",
    marginBottom: 10,
  },
  menuBtnText: {
    color: "#22c55e",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
  },
});
