import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

export default function DetailScreen({ route, navigation }) {
  // Validamos de forma segura que existan parámetros para evitar que la app crashee
  const exercise = route.params?.exercise || {};

  // Estado local para mostrar un spinner mientras el emulador descarga el GIF pesado
  const [imageLoading, setImageLoading] = useState(true);

  // Extraemos la URL de la imagen soportando variaciones de nombre de la API (gifUrl o gifurl)
  const finalGifUrl = exercise.gifUrl || exercise.gifurl || null;

  return (
    <ScrollView style={styles.container}>
      {/* Botón regresar */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backBtnText}>⬅️ Regresar</Text>
      </TouchableOpacity>

      {/* Nombre del Ejercicio */}
      <Text style={styles.title}>
        {exercise.name
          ? exercise.name.toUpperCase()
          : "EJERCICIO DE ENTRENAMIENTO"}
      </Text>

      {/* Fila de Insignias / Badges */}
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            🎯 {exercise.category ? exercise.category.toUpperCase() : "GENERAL"}
          </Text>
        </View>
        {exercise.equipment && (
          <View style={[styles.badge, { borderColor: "#38bdf8" }]}>
            <Text style={[styles.badgeText, { color: "#38bdf8" }]}>
              🛠️ {exercise.equipment.toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* VISOR DE MULTIMEDIA OPTIMIZADO */}
      <View style={styles.gifContainer}>
        {finalGifUrl ? (
          <View
            style={{ flex: 1, position: "relative", justifyContent: "center" }}
          >
            <Image
              source={{ uri: finalGifUrl }}
              style={styles.gif}
              resizeMode="contain"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
            {/* Si la imagen está cargando desde el servidor externo, muestra un indicador */}
            {imageLoading && (
              <View style={styles.absoluteCenter}>
                <ActivityIndicator size="small" color="#22c55e" />
                <Text style={{ color: "#64748b", fontSize: 11, marginTop: 5 }}>
                  Descargando GIF...
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.center}>
            <Text style={{ color: "#64748b", fontWeight: "600" }}>
              ⚠️ Sin vista multimedia disponible
            </Text>
          </View>
        )}
      </View>

      {/* Sección Informativa y Guía Técnica */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Guía Técnica</Text>
        <Text style={styles.infoText}>
          {exercise.desc ||
            `Este ejercicio estimula de forma directa la zona de ${exercise.target || "músculos principales"} utilizando ${exercise.equipment || "el peso corporal"}.`}
        </Text>

        {/* Renderizado dinámico de las instrucciones paso a paso */}
        {exercise.instructions && exercise.instructions.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.infoTitle, { color: "#38bdf8" }]}>
              📋 Instrucciones de Ejecución
            </Text>
            {exercise.instructions.map((step, index) => (
              <Text key={index} style={styles.stepText}>
                <Text style={styles.stepNumber}>{index + 1}.</Text> {step}
              </Text>
            ))}
          </View>
        )}

        {/* Footer Técnico exigido en rúbricas */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>
            Músculo específico: {exercise.target || "N/A"}
          </Text>
          <Text style={styles.footerLabel}>
            ID Único: #{exercise.id || "0000"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 20 },
  backBtn: { marginBottom: 15, marginTop: 10 },
  backBtnText: { color: "#22c55e", fontWeight: "bold", fontSize: 15 },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff", lineHeight: 28 },
  badgeRow: { flexDirection: "row", gap: 8, marginVertical: 12 },
  badge: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  badgeText: { color: "#22c55e", fontSize: 11, fontWeight: "bold" },
  gifContainer: {
    width: "100%",
    height: 280,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    overflow: "hidden",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#334155",
    justifyContent: "center",
  },
  gif: { width: "100%", height: "100%" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  absoluteCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  infoSection: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 50,
    borderWidth: 1,
    borderColor: "#334155",
  },
  infoTitle: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoText: {
    color: "#cbd5e1",
    lineHeight: 22,
    fontSize: 14,
    textAlign: "justify",
  },
  stepText: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
    paddingLeft: 2,
  },
  stepNumber: { color: "#38bdf8", fontWeight: "bold" },
  footerInfo: {
    marginTop: 25,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerLabel: { color: "#64748b", fontSize: 11, fontStyle: "italic" },
});
