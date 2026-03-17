import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";

export default function DetailScreen({ route }) {
  const { exercise } = route.params;

  const translation =
    exercise?.translations?.find((t) => t.language === 4) ||
    exercise?.translations?.find((t) => t.language === 2) ||
    exercise?.translations?.[0];

  const exerciseName = translation?.name || "Ejercicio";
  const description = translation?.description || "Sin descripción disponible";

  const cleanDescription = description.replace(/<[^>]*>/g, "");

  const muscleImage =
    exercise?.muscles?.[0]?.image_url_main ||
    exercise?.muscles_secondary?.[0]?.image_url_main ||
    null;

  return (
    <ScrollView style={styles.container}>
      {muscleImage ? (
        <Image source={{ uri: muscleImage }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.noImage]}>
          <Text style={styles.noImageText}>Sin imagen disponible</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{exerciseName}</Text>

        <Text style={styles.text}>
          Categoría: {exercise?.category?.name || "Sin dato"}
        </Text>

        <Text style={styles.text}>ID: {exercise?.id || "Sin dato"}</Text>

        {exercise?.muscles && exercise.muscles.length > 0 && (
          <Text style={styles.text}>
            Músculos:{" "}
            {exercise.muscles.map((m) => m.name_en || m.name).join(", ")}
          </Text>
        )}

        {exercise?.muscles_secondary &&
          exercise.muscles_secondary.length > 0 && (
            <Text style={styles.text}>
              Músculos secundarios:{" "}
              {exercise.muscles_secondary
                .map((m) => m.name_en || m.name)
                .join(", ")}
            </Text>
          )}

        <Text style={styles.section}>Descripción</Text>
        <Text style={styles.description}>{cleanDescription}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  image: {
    width: "100%",
    height: 260,
    backgroundColor: "#e5e7eb",
  },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    fontSize: 16,
    color: "#6b7280",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 8,
  },
  section: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  description: {
    marginTop: 8,
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
  },
});
