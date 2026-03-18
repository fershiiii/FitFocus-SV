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
      {/* Imagen */}
      <View style={styles.imageContainer}>
        {muscleImage ? (
          <Image source={{ uri: muscleImage }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.noImage]}>
            <Text style={styles.noImageText}>Sin imagen</Text>
          </View>
        )}

        {/* Overlay oscuro */}
        <View style={styles.overlay} />

        {/* Categoría */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {item?.category?.name || "General"}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title}>{exerciseName}</Text>

        <Text style={styles.description} numberOfLines={2}>
          {cleanDescription}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1f2937",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  imageContainer: {
    position: "relative",
  },

  image: {
    width: "100%",
    height: 190,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  noImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#374151",
  },

  noImageText: {
    color: "#9ca3af",
    fontSize: 14,
  },

  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#22c55e",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  info: {
    padding: 14,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f9fafb",
    marginBottom: 6,
  },

  description: {
    fontSize: 13,
    color: "#d1d5db",
    lineHeight: 18,
  },
});
