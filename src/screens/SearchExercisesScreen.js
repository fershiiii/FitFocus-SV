import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  searchExercisesByName,
  listEquipment,
  listExercisesByEquipment,
} from "../services/api";

export default function SearchExercisesScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carga inicial segura de accesorios
  useEffect(() => {
    async function loadInitialData() {
      const equipList = await listEquipment();
      if (Array.isArray(equipList)) {
        setEquipments(equipList.slice(0, 4));
      }
    }
    loadInitialData();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const data = await searchExercisesByName(query);
    if (Array.isArray(data)) {
      setResults(data.slice(0, 25));
    } else {
      setResults([]);
    }
    setLoading(false);
  };

  const handleFilterByEquipment = async (equipName) => {
    setLoading(true);
    setQuery("");
    const data = await listExercisesByEquipment(equipName);
    if (Array.isArray(data)) {
      setResults(data.slice(0, 25));
    } else {
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Buscador Avanzado</Text>
      <Text style={styles.subtitle}>
        Consulta global por nombre o equipamiento
      </Text>

      {/* 🛠️ CORRECCIÓN AQUÍ: Cambiado <div> por <View> nativo de React Native */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Ej: bench, press, dumbbell, squat..."
          placeholderTextColor="#64748b"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Filtrar por Accesorio:</Text>
      <View style={styles.equipContainer}>
        {equipments &&
          equipments.map((equip, index) => (
            <TouchableOpacity
              key={index}
              style={styles.equipBtn}
              onPress={() => handleFilterByEquipment(equip)}
            >
              <Text style={styles.equipBtnText} numberOfLines={1}>
                ⚙️ {equip}
              </Text>
            </TouchableOpacity>
          ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#38bdf8" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("Detail", { exercise: item })}
            >
              {item.gifUrl ? (
                <Image source={{ uri: item.gifUrl }} style={styles.thumbnail} />
              ) : (
                <View
                  style={[styles.thumbnail, { backgroundColor: "#334155" }]}
                />
              )}
              <View style={styles.cardContent}>
                <Text style={styles.exerciseName} numberOfLines={1}>
                  {item.name ? item.name.toUpperCase() : "EJERCICIO"}
                </Text>
                <Text style={styles.exerciseTarget}>
                  🎯 Músculo: {item.target || "General"} | 🛠️{" "}
                  {item.equipment || "Ninguno"}
                </Text>
              </View>
              <Text style={styles.arrow}>➔</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Escribe un ejercicio en inglés o selecciona un accesorio para
              buscar.
            </Text>
          }
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
    paddingTop: 15,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 13, color: "#64748b", marginBottom: 15 },
  searchBox: { flexDirection: "row", marginBottom: 15, gap: 10 },
  input: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#334155",
    height: 45,
  },
  searchBtn: {
    backgroundColor: "#38bdf8",
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  equipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 20,
  },
  equipBtn: {
    backgroundColor: "#1e293b",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#334155",
    width: "48%",
  },
  equipBtnText: { color: "#cbd5e1", fontSize: 11, textTransform: "capitalize" },
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
    backgroundColor: "#fff",
  },
  cardContent: { flex: 1, marginLeft: 12 },
  exerciseName: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  exerciseTarget: { color: "#94a3b8", fontSize: 11, marginTop: 4 },
  arrow: { color: "#38bdf8", fontSize: 16, marginLeft: 5 },
  emptyText: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 40,
    fontSize: 13,
    lineHeight: 18,
  },
});
