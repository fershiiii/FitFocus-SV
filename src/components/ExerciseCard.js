import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

export default function ExerciseCard({ item, onPress }) {
  const translation =
    item?.translations?.find((t) => t.language === 4) ||
    item?.translations?.find((t) => t.language === 2) ||
    item?.translations?.[0];

  const exerciseName = translation?.name || "Ejercicio";
  const description = translation?.description || "Sin descripción disponible";

  const cleanDescription = description.replace(/<[^>]*>/g, "");

  const muscleImage =
    item?.muscles?.[0]?.image_url_main ||
    item?.muscles_secondary?.[0]?.image_url_main ||
    null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {muscleImage ? (
        <Image source={{ uri: muscleImage }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.noImage]}>
          <Text style={styles.noImageText}>Sin imagen</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title}>{exerciseName}</Text>

        <Text style={styles.text}>
          Categoría: {item?.category?.name || "Sin dato"}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {cleanDescription}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: "#e5e7eb",
  },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    color: "#6b7280",
    fontSize: 16,
  },
  info: {
    padding: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    color: "#6b7280",
  },
});
