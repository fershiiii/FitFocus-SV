import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
// 💥 CAMBIO CRÍTICO: Importamos el API legacy que exige tu versión actual de Expo para Base64
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";

// 🔑 TU LLAVE REAL DE GOOGLE GEMINI:
const GEMINI_API_KEY = "AIzaSyAhU06ElKm8B-yrRzVe8L0fe8VVM8PmrGQ";

export default function DietTrackerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [macroReport, setMacroReport] = useState(null);

  const cameraRef = useRef(null);

  // Función para abrir la galería interna de BlueStacks
  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permiso Denegado",
          "FitFocus necesita acceso a tus fotos para poder analizar tus alimentos.",
        );
        return;
      }

      // 🛠️ FIX DE MEDIATYPE: Cambiado a un array de strings para remover las advertencias de deprecación
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.5,
      });

      if (result.canceled) return;

      setAnalyzing(true);
      setIsCameraActive(false);

      const selectedImageUri = result.assets[0].uri;

      // 🛠️ FIX DE FILESYSTEM: Ahora lee perfectamente desde la ubicación legacy sin tumbar la app
      const base64Image = await FileSystem.readAsStringAsync(selectedImageUri, {
        encoding: "base64",
      });

      await sendToGemini(base64Image);
    } catch (e) {
      Alert.alert(
        "Error de Almacenamiento",
        "No se pudo leer la imagen seleccionada de la galería.",
      );
      console.error(e);
      setAnalyzing(false);
    }
  };

  // Función para capturar foto en vivo desde la cámara
  const handleTakePicture = async () => {
    if (!cameraRef.current) return;
    try {
      setAnalyzing(true);
      setIsCameraActive(false);

      const options = { quality: 0.5, skipProcessing: false };
      const photo = await cameraRef.current.takePictureAsync(options);

      // 🛠️ FIX DE FILESYSTEM (CÁMARA)
      const base64Image = await FileSystem.readAsStringAsync(photo.uri, {
        encoding: "base64",
      });

      await sendToGemini(base64Image);
    } catch (e) {
      Alert.alert("Error de Cámara", "No se pudo capturar la foto.");
      console.error(e);
      setAnalyzing(false);
    }
  };

  // 💥 FUNCIÓN OPTIMIZADA: Petición HTTP por headers y limpieza estricta de JSON para Gemini
  const sendToGemini = async (base64Data) => {
    try {
      // 1. LIMPIEZA DE BASE64: Eliminamos saltos de línea (\n) y cabeceras que arrastra BlueStacks
      const cleanBase64 = base64Data
        .replace(/^data:image\/[a-z]+;base64,/, "")
        .replace(/\r?\n|\r/g, "")
        .trim();

      const promptText =
        "Analiza esta foto de comida. Identifica el platillo principal y calcula de forma aproximada: calorías totales (kcal), proteínas (g), carbohidratos (g), y grasas (g). Devuelve ÚNICAMENTE un objeto JSON válido con las llaves exactas: 'foodName', 'calories', 'protein', 'carbs', 'fats'. No uses formato de bloque markdown de código (```json), no uses saltos de línea innecesarios, solo devuelve el texto plano del objeto JSON.";

      // URL base limpia sin exponer la API Key en los parámetros
      const url =
        "[https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent](https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent)";

      console.log("🚀 Desplegando payload hacia Google Gemini...");

      // 2. Petición pasando la API Key por Headers (Evita rechazos del backend de Google)
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY, // 👈 Inyección nativa en cabeceras
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
              ],
            },
          ],
        }),
      });

      const resJson = await response.json();

      // 3. Captura si Google nos devuelve un error controlado (ej. cuota excedida)
      if (resJson.error) {
        console.log(
          "❌ Error de Google API:",
          JSON.stringify(resJson.error, null, 2),
        );
        throw new Error(resJson.error.message);
      }

      // Validamos que los servidores de Google hayan devuelto una respuesta con contenido
      const aiText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiText) {
        throw new Error(
          "Respuesta vacía o bloqueada por políticas de seguridad de Google.",
        );
      }

      let rawText = aiText.trim();
      console.log("🤖 Respuesta cruda de la IA:", rawText);

      // 🛠️ LIMPIEZA REGEX: Nos aseguramos de purgar envolturas markdown si la IA las genera
      rawText = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/[\u201c\u201d]/g, '"')
        .trim();

      // Parseamos el JSON de forma segura
      const parsedData = JSON.parse(rawText);

      setMacroReport({
        foodName: parsedData.foodName || "Platillo Detectado",
        calories: Number(parsedData.calories) || 0,
        protein: Number(parsedData.protein) || 0,
        carbs: Number(parsedData.carbs) || 0,
        fats: Number(parsedData.fats) || 0,
        confidence: "Google Gemini 1.5 Real-Time",
      });
    } catch (error) {
      Alert.alert(
        "Error de Estructura IA",
        "La Inteligencia Artificial no pudo formatear este archivo. Por favor, reintenta el escaneo con otra imagen limpia.",
      );
      console.error("Detalle del error parseando el JSON:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📸 Reconocimiento Nutricional IA</Text>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionText}>
            FitFocus requiere acceso a la cámara y al almacenamiento del
            dispositivo para analizar los macronutrientes de tus platillos
            usando Inteligencia Artificial.
          </Text>
          <TouchableOpacity
            style={styles.btnPermission}
            onPress={requestPermission}
          >
            <Text style={styles.btnPermissionText}>
              🛡️ Conceder Permisos Nativos
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>📸 Visión Artificial Nutricional</Text>
      <Text style={styles.subtitle}>
        Escanea o busca la foto de tus alimentos desde la galería de tu
        dispositivo con Google Gemini IA.
      </Text>

      {/* VISOR DE CÁMARA O CONTENEDOR PRINCIPAL */}
      {isCameraActive ? (
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} ref={cameraRef}>
            <View style={styles.overlayContainer}>
              <View style={styles.scanTargetFrame} />
              <View style={styles.cameraActionRow}>
                <TouchableOpacity
                  style={styles.btnCancelCam}
                  onPress={() => setIsCameraActive(false)}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}
                  >
                    ✖ Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.captureCircleBtn}
                  onPress={handleTakePicture}
                />
                <View style={{ width: 60 }} />
              </View>
            </View>
          </CameraView>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          {analyzing ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#38bdf8" />
              <Text style={styles.analyzingText}>
                Gemini IA está analizando los pixeles del archivo
                seleccionado...
              </Text>
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={styles.cameraIcon}>🥗</Text>
              <Text style={styles.placeholderText}>
                Captura o selecciona una foto de tu plato
              </Text>

              <TouchableOpacity
                style={styles.btnActivateCamera}
                onPress={() => setIsCameraActive(true)}
              >
                <Text style={styles.btnActivateCameraText}>
                  📷 Encender Cámara en Vivo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnGallery}
                onPress={handlePickImage}
              >
                <Text style={styles.btnGalleryText}>
                  📂 Buscar en mi Dispositivo
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* REPORTE GENERADO REAL POR LA IA */}
      {macroReport && (
        <View style={styles.reportContainer}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>
              🤖 Clasificación de Red Neuronal
            </Text>
            <Text style={styles.confidenceTag}>{macroReport.confidence}</Text>
          </View>

          <Text style={styles.foodTitle}>
            {macroReport.foodName.toUpperCase()}
          </Text>

          <View style={styles.caloriesBanner}>
            <Text style={styles.caloriesText}>{macroReport.calories} kcal</Text>
            <Text style={styles.caloriesLabel}>Energía Computada</Text>
          </View>

          <View style={styles.macrosRow}>
            <View style={[styles.macroCard, { borderColor: "#ef4444" }]}>
              <Text style={[styles.macroVal, { color: "#ef4444" }]}>
                {macroReport.protein}g
              </Text>
              <Text style={styles.macroLabel}>Proteínas</Text>
            </View>
            <View style={[styles.macroCard, { borderColor: "#38bdf8" }]}>
              <Text style={[styles.macroVal, { color: "#38bdf8" }]}>
                {macroReport.carbs}g
              </Text>
              <Text style={styles.macroLabel}>Carbohidratos</Text>
            </View>
            <View style={[styles.macroCard, { borderColor: "#eab308" }]}>
              <Text style={[styles.macroVal, { color: "#eab308" }]}>
                {macroReport.fats}g
              </Text>
              <Text style={styles.macroLabel}>Grasas</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 5 },
  subtitle: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 20,
  },
  center: { justifyContent: "center", alignItems: "center", padding: 20 },
  permissionBox: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    marginTop: 30,
    alignItems: "center",
  },
  permissionText: {
    color: "#cbd5e1",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  },
  btnPermission: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  btnPermissionText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  cameraContainer: {
    width: "100%",
    height: 320,
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
  },
  camera: { flex: 1 },
  overlayContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  scanTargetFrame: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: "#22c55e",
    borderRadius: 12,
    borderStyle: "dashed",
    marginTop: 5,
  },
  cameraActionRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  btnCancelCam: {
    backgroundColor: "rgba(239, 68, 68, 0.7)",
    padding: 8,
    borderRadius: 6,
  },
  captureCircleBtn: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "#22c55e",
    marginRight: 40,
  },
  placeholderContainer: {
    width: "100%",
    height: 280,
    backgroundColor: "#1e293b",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  cameraIcon: { fontSize: 45, marginBottom: 5 },
  placeholderText: { color: "#64748b", fontSize: 13, marginBottom: 15 },
  btnActivateCamera: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#22c55e",
    width: 220,
    alignItems: "center",
    marginBottom: 10,
  },
  btnActivateCameraText: { color: "#22c55e", fontWeight: "bold", fontSize: 13 },
  btnGallery: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#38bdf8",
    width: 220,
    alignItems: "center",
  },
  btnGalleryText: { color: "#38bdf8", fontWeight: "bold", fontSize: 13 },
  analyzingText: {
    color: "#38bdf8",
    marginTop: 15,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  reportContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    paddingBottom: 10,
    marginBottom: 10,
  },
  reportTitle: { color: "#22c55e", fontSize: 14, fontWeight: "bold" },
  confidenceTag: { color: "#38bdf8", fontSize: 11, fontWeight: "600" },
  foodTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 15,
  },
  caloriesBanner: {
    backgroundColor: "#0f172a",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#334155",
  },
  caloriesText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  caloriesLabel: { color: "#64748b", fontSize: 11, marginTop: 2 },
  macrosRow: { flexDirection: "row", justifyContent: "space-between" },
  macroCard: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginHorizontal: 3,
    borderWidth: 1,
  },
  macroVal: { fontSize: 16, fontWeight: "bold" },
  macroLabel: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 2,
    fontWeight: "600",
  },
});
