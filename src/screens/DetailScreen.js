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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageWrapper}>
        {muscleImage ? (
          <Image source={{ uri: muscleImage }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.noImage]}>
            <Text style={styles.noImageText}>Sin imagen disponible</Text>
          </View>
        )}

        <View style={styles.overlay} />

        <View style={styles.imageContent}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {exercise?.category?.name || "General"}
            </Text>
          </View>

          <Text style={styles.title}>{exerciseName}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Información general</Text>

          <Text style={styles.text}>
            <Text style={styles.label}>ID:</Text> {exercise?.id || "Sin dato"}
          </Text>

          <Text style={styles.text}>
            <Text style={styles.label}>Categoría:</Text>{" "}
            {exercise?.category?.name || "Sin dato"}
          </Text>
        </View>

        {exercise?.muscles && exercise.muscles.length > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Músculos principales</Text>
            <Text style={styles.text}>
              {exercise.muscles.map((m) => m.name_en || m.name).join(", ")}
            </Text>
          </View>
        )}

        {exercise?.muscles_secondary &&
          exercise.muscles_secondary.length > 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Músculos secundarios</Text>
              <Text style={styles.text}>
                {exercise.muscles_secondary
                  .map((m) => m.name_en || m.name)
                  .join(", ")}
              </Text>
            </View>
          )}

        <View style={styles.descriptionCard}>
          <Text style={styles.section}>Descripción</Text>
          <Text style={styles.description}>{cleanDescription}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  imageWrapper: {
    position: "relative",
  },

  image: {
    width: "100%",
    height: 300,
    backgroundColor: "#1e293b",
  },

  noImage: {
    justifyContent: "center",
    alignItems: "center",
  },

  noImageText: {
    fontSize: 16,
    color: "#94a3b8",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  imageContent: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#22c55e",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 10,
  },

  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#ffffff",
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  infoCard: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },

  descriptionCard: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 10,
  },

  section: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 10,
  },

  text: {
    fontSize: 15,
    color: "#cbd5e1",
    marginBottom: 8,
    lineHeight: 22,
  },

  label: {
    fontWeight: "bold",
    color: "#22c55e",
  },

  description: {
    fontSize: 15,
    color: "#cbd5e1",
    lineHeight: 24,
  },
});
