import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { getExercises } from "../services/api";
import ExerciseCard from "../components/ExerciseCard";

export default function HomeScreen({ navigation }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadExercises = async () => {
    setLoading(true);
    const data = await getExercises();
    setExercises(data);
    setLoading(false);
  };

  useEffect(() => {
    loadExercises();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text>Cargando ejercicios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FitFocus SV</Text>

      <FlatList
        data={exercises}
        keyExtractor={(item, index) => String(item.id || index)}
        renderItem={({ item }) => (
          <ExerciseCard
            item={item}
            onPress={() => navigation.navigate("Detail", { exercise: item })}
          />
        )}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Profile")}
      >
        <Text style={styles.buttonText}>Ir al perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#111827",
  },
  button: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
