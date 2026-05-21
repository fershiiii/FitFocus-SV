import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
// 💥 CAMBIO MULTIMEDIA: Usamos expo-image para asegurar la reproducción de GIFs animados
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getExercisesByCategory } from "../services/api";

export default function ExercisesScreen({ route, navigation }) {
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("pecho");
  const [loading, setLoading] = useState(true);

  // 🎯 CAPTURA DEL PARÁMETRO: Capturamos el ID de la rutina si el flujo viene de RoutineDetail
  const addingToRoutineId = route.params?.addingToRoutineId;

  // Carga inicial (Pecho)
  useEffect(() => {
    loadExercisesFromAPI("pecho");
  }, []);

  // Función para consultar la API en tiempo real según el botón presionado
  const loadExercisesFromAPI = async (category) => {
    setLoading(true);
    setSelectedCategory(category);
    const data = await getExercisesByCategory(category);
    setFilteredExercises(data);
    setLoading(false);
  };

  // 💥 NUEVA LÓGICA DE INYECCIÓN MULTIPLE (SIN CIERRE DE PANTALLA)
  const handleAddExercise = async (exerciseItem) => {
    // Caso A: Si no hay una rutina seleccionada previamente, usa el flujo clásico
    if (!addingToRoutineId) {
      navigation.navigate("CreateRoutine", {
        selectedExercise: exerciseItem.name,
      });
      return;
    }

    // Caso B: Si venimos desde una rutina, acumulamos los ejercicios en la memoria local
    try {
      const stored = await AsyncStorage.getItem("@user_routines");
      if (stored) {
        let json = JSON.parse(stored);
        let yaExiste = false;

        // Mapeamos el arreglo local buscando la rutina activa
        json = json.map((rutina) => {
          if (rutina.id === addingToRoutineId) {
            const listaActual = rutina.exercises || [];

            // Evitamos duplicar exactamente el mismo ejercicio por error en la misma rutina
            const esDuplicado = listaActual.some(
              (ex) => ex.id === exerciseItem.id,
            );
            if (esDuplicado) {
              yaExiste = true;
              return rutina;
            }

            return {
              ...rutina,
              // 💥 Spread operator sobre los ejercicios existentes + el nuevo elemento de la API
              exercises: [...listaActual, exerciseItem],
            };
          }
          return rutina;
        });

        if (yaExiste) {
          Alert.alert(
            "Aviso",
            "Este ejercicio ya fue agregado a la rutina activa.",
          );
          return;
        }

        // Guardamos de vuelta en la persistencia local de forma asíncrona
        await AsyncStorage.setItem("@user_routines", JSON.stringify(json));

        // El secreto del éxito: Mostramos alerta flash de éxito pero NO llamamos a goBack().
        // Así puedes navegar entre categorías y seguir sumando todo tu entrenamiento.
        Alert.alert(
          "💪 Añadido",
          `¡${exerciseItem.name.toUpperCase()} se sumó a tu rutina!\n\nPuedes seguir agregando más ejercicios.`,
        );
      }
    } catch (e) {
      Alert.alert(
        "Error",
        "No se pudo acoplar el ejercicio a la memoria local.",
      );
      console.error(e);
    }
  };

  const categories = [
    { id: "pecho", label: "💪 Pecho" },
    { id: "espalda", label: "🦅 Espalda" },
    { id: "piernas", label: "🍗 Piernas" },
    { id: "hombros", label: "🛡️ Hombros" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏋️ Biblioteca Hub</Text>
      <Text style={styles.subtitle}>
        {addingToRoutineId
          ? "🎯 Modo Asignación: Añade múltiples ejercicios a tu rutina"
          : "Datos dinámicos desde ExerciseDB REST API"}
      </Text>

      {/* Render de los selectores (CORREGIDO: Altura fija limpia para evitar colisiones) */}
      <View style={styles.categoryContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryButton,
              selectedCategory === cat.id && styles.categoryButtonActive,
            ]}
            onPress={() => loadExercisesFromAPI(cat.id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat.id && styles.categoryTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista con indicador de carga real */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={{ color: "#22c55e", marginTop: 10, fontSize: 12 }}>
            Consultando Endpoint de RapidAPI...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 30 }} // Espacio de seguridad al final del scroll
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                onPress={() =>
                  navigation.navigate("Detail", { exercise: item })
                }
              >
                <Image source={{ uri: item.gifUrl }} style={styles.thumbnail} />
                <View style={styles.cardContent}>
                  <Text style={styles.exerciseName} numberOfLines={1}>
                    {item.name ? item.name.toUpperCase() : "EJERCICIO"}
                  </Text>
                  <Text style={styles.exerciseDesc} numberOfLines={1}>
                    🎯 {item.target || "Músculo"} | 🛠️{" "}
                    {item.equipment || "Ninguno"}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Botón interactivo de agregar */}
              <TouchableOpacity
                style={styles.btnAdd}
                onPress={() => handleAddExercise(item)}
              >
                <Text style={styles.btnAddText}>➕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 13, color: "#64748b", marginBottom: 15 },
  // 🛠️ FIX VISUAL: Eliminamos el flex conflictivo. Ahora es una barra estricta de 46dp
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 46,
    marginBottom: 20,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: "#1e293b",
    marginHorizontal: 3,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryButtonActive: { backgroundColor: "#22c55e" },
  categoryText: { color: "#94a3b8", fontSize: 11, fontWeight: "bold" },
  categoryTextActive: { color: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: "#ffffff",
  },
  cardContent: { flex: 1, marginLeft: 12 },
  exerciseName: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  exerciseDesc: { color: "#94a3b8", fontSize: 11, marginTop: 2 },
  btnAdd: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  btnAddText: { color: "#22c55e", fontWeight: "bold", fontSize: 14 },
});
