import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { getExercises } from "../services/api";
import ExerciseCard from "../components/ExerciseCard";

export default function HomeScreen({ navigation }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await getExercises();
      setExercises(data);
    } catch (error) {
      console.log("Error al cargar ejercicios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <View style={styles.center}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={styles.loadingTitle}>Cargando rutina...</Text>
            <Text style={styles.loadingText}>
              Preparando tus ejercicios de hoy
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <View style={styles.header}>
        <Text style={styles.welcome}>Bienvenido</Text>
        <Text style={styles.title}>FitFocus SV</Text>
        <Text style={styles.subtitle}>
          Entrena fuerte, mantente constante y supera tus límites
        </Text>
      </View>

      <FlatList
        data={exercises}
        keyExtractor={(item, index) => String(item.id || index)}
        renderItem={({ item }) => (
          <ExerciseCard
            item={item}
            onPress={() => navigation.navigate("Detail", { exercise: item })}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Profile")}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>Ver mi perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  loaderBox: {
    backgroundColor: "#1e293b",
    paddingVertical: 30,
    paddingHorizontal: 24,
    borderRadius: 22,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },

  loadingTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "bold",
    color: "#f8fafc",
  },

  loadingText: {
    marginTop: 6,
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },

  header: {
    marginBottom: 18,
  },

  welcome: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#f8fafc",
  },

  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 6,
    lineHeight: 20,
  },

  listContent: {
    paddingBottom: 110,
  },

  button: {
    position: "absolute",
    bottom: 18,
    left: 16,
    right: 16,
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#22c55e",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
});
