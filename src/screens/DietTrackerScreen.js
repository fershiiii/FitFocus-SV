import React, { useState, useRef, useEffect } from "react";
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
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
// 💥 NUEVA IMPORTACIÓN: Librería nativa para guardar datos en el almacenamiento del celular
import AsyncStorage from "@react-native-async-storage/async-storage";

// CAMBIALO POR ESTO:
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const STORAGE_KEY = "@fitfocus_historial_dietas";

export default function DietTrackerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [macroReport, setMacroReport] = useState(null);

  // 💥 ESTADO NUEVO: Almacena la lista de comidas guardadas en el historial
  const [historyList, setHistoryList] = useState([]);

  const cameraRef = useRef(null);

  // 💥 EFECTO DE CARGA: Lee el almacenamiento del celular al abrir la pantalla
  useEffect(() => {
    cargarHistorialLocal();
  }, []);

  // Función para cargar los datos guardados en el dispositivo
  const cargarHistorialLocal = async () => {
    try {
      const datosGuardados = await AsyncStorage.getItem(STORAGE_KEY);
      if (datosGuardados) {
        setHistoryList(JSON.parse(datosGuardados));
      }
    } catch (error) {
      console.error("Error cargando historial de AsyncStorage:", error);
    }
  };

  // 💥 FUNCIÓN PARA GUARDAR: Añade la nueva comida al almacenamiento persistente
  const guardarEnHistorialLocal = async (nuevaComida) => {
    try {
      const comidaConFecha = {
        id: Date.now().toString(), // ID único basado en el tiempo
        foodName: nuevaComida.foodName,
        calories: nuevaComida.calories,
        protein: nuevaComida.protein,
        carbs: nuevaComida.carbs,
        fats: nuevaComida.fats,
        fecha:
          new Date().toLocaleDateString() +
          " " +
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
      };

      const nuevoHistorial = [comidaConFecha, ...historyList];
      setHistoryList(nuevoHistorial);

      // Guardado físico en el almacenamiento interno de Android / BlueStacks
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevoHistorial));
    } catch (error) {
      console.error("Error guardando en AsyncStorage:", error);
    }
  };

  // 💥 FUNCIÓN NUEVA: Permite borrar todo el historial si los profesores quieren hacer pruebas limpias
  const limpiarHistorial = async () => {
    Alert.alert(
      "Limpiar Historial",
      "¿Seguro que quieres borrar todas las comidas guardadas?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar todo",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(STORAGE_KEY);
              setHistoryList([]);
              setMacroReport(null);
            } catch (error) {
              console.error(error);
            }
          },
        },
      ],
    );
  };

  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permiso Denegado",
          "FitFocus necesita acceso a tus fotos.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.1, // Calidad optimizada para que el Base64 no sea pesado
      });

      if (result.canceled) return;

      setAnalyzing(true);
      setIsCameraActive(false);

      const selectedImageUri = result.assets[0].uri;
      const base64Image = await FileSystem.readAsStringAsync(selectedImageUri, {
        encoding: "base64",
      });

      await sendToGemini(base64Image);
    } catch (e) {
      Alert.alert("Error", "No se pudo leer la imagen.");
      setAnalyzing(false);
    }
  };

  const handleTakePicture = async () => {
    if (!cameraRef.current) return;
    try {
      setAnalyzing(true);
      setIsCameraActive(false);

      const options = { quality: 0.1, skipProcessing: false };
      const photo = await cameraRef.current.takePictureAsync(options);

      const base64Image = await FileSystem.readAsStringAsync(photo.uri, {
        encoding: "base64",
      });

      await sendToGemini(base64Image);
    } catch (e) {
      Alert.alert("Error", "No se pudo capturar la foto.");
      setAnalyzing(false);
    }
  };

  const sendToGemini = async (base64Data) => {
    try {
      const cleanBase64 = base64Data
        .replace(/^data:image\/[a-z]+;base64,/, "")
        .replace(/\r?\n|\r/g, "")
        .trim();

      const promptText =
        "Analiza esta foto de comida. Identifica el platillo principal y calcula de forma aproximada: calorías totales (kcal), proteínas (g), carbohidratos (g), y grasas (g). Devuelve ÚNICAMENTE un objeto JSON válido con las llaves exactas: 'foodName', 'calories', 'protein', 'carbs', 'fats'. No uses formato markdown de código (```json), solo devuelve el texto plano del objeto JSON.";

      const url =
        "[https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent](https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent)";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
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

      if (resJson.error) {
        throw new Error(resJson.error.message);
      }

      const aiText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiText) {
        throw new Error("Respuesta vacía de los servidores de Google.");
      }

      let rawText = aiText
        .trim()
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/[\u201c\u201d]/g, '"')
        .trim();

      const parsedData = JSON.parse(rawText);

      const reporteTemporal = {
        foodName: parsedData.foodName || "Platillo Detectado",
        calories: Number(parsedData.calories) || 0,
        protein: Number(parsedData.protein) || 0,
        carbs: Number(parsedData.carbs) || 0,
        fats: Number(parsedData.fats) || 0,
        confidence: "Google Gemini 1.5 Real-Time",
      };

      setMacroReport(reporteTemporal);

      // 💥 DISPARADOR: Guardamos automáticamente el resultado en el almacenamiento interno
      await guardarEnHistorialLocal(reporteTemporal);
    } catch (error) {
      Alert.alert(
        "Error de Escaneo",
        "La IA no pudo procesar esta imagen. Reintenta con una foto de comida clara.",
      );
      console.error(error);
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
            dispositivo para analizar los alimentos.
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
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <Text style={styles.title}>📸 Visión Artificial Nutricional</Text>
      <Text style={styles.subtitle}>
        Escanea o busca fotos de tus alimentos para guardarlos en tu registro
        diario.
      </Text>

      {/* VISOR DE CÁMARA */}
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
                Gemini IA está analizando los pixeles del archivo...
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

      {/* REPORTE GENERADO EN EL INSTANTE */}
      {macroReport && (
        <View style={styles.reportContainer}>
          <Text style={styles.reportTitle}>🤖 Último Platillo Escaneado</Text>
          <Text style={styles.foodTitle}>
            {macroReport.foodName.toUpperCase()}
          </Text>
          <View style={styles.caloriesBanner}>
            <Text style={styles.caloriesText}>{macroReport.calories} kcal</Text>
          </View>
          <View style={styles.macrosRow}>
            <View style={[styles.macroCard, { borderColor: "#ef4444" }]}>
              <Text style={{ color: "#ef4444", fontWeight: "bold" }}>
                {macroReport.protein}g
              </Text>
              <Text style={styles.macroLabel}>Prot</Text>
            </View>
            <View style={[styles.macroCard, { borderColor: "#38bdf8" }]}>
              <Text style={{ color: "#38bdf8", fontWeight: "bold" }}>
                {macroReport.carbs}g
              </Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={[styles.macroCard, { borderColor: "#eab308" }]}>
              <Text style={{ color: "#eab308", fontWeight: "bold" }}>
                {macroReport.fats}g
              </Text>
              <Text style={styles.macroLabel}>Grasas</Text>
            </View>
          </View>
        </View>
      )}

      {/* 💥 SECCIÓN NUEVA: Historial Persistente de Alimentos Guardados */}
      <View style={styles.historySection}>
        <View style={styles.historyHeader}>
          <Text style={styles.historySectionTitle}>
            📋 Historial de Registros Guardados
          </Text>
          {historyList.length > 0 && (
            <TouchableOpacity onPress={limpiarHistorial}>
              <Text style={styles.deleteText}>Borrar Todo</Text>
            </TouchableOpacity>
          )}
        </View>

        {historyList.length === 0 ? (
          <Text style={styles.emptyHistoryText}>
            No hay registros guardados en este dispositivo todavía.
          </Text>
        ) : (
          historyList.map((item) => (
            <View key={item.id} style={styles.historyItemCard}>
              <View>
                <Text style={styles.historyFoodName}>{item.foodName}</Text>
                <Text style={styles.historyDate}>{item.fecha}</Text>
              </View>
              <View style={styles.historyMetrics}>
                <Text style={styles.historyCal}>{item.calories} kcal</Text>
                <Text style={styles.historyMacrosMini}>
                  P: {item.protein}g | C: {item.carbs}g | G: {item.fats}g
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
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
  reportTitle: {
    color: "#22c55e",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 5,
  },
  foodTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  caloriesBanner: {
    backgroundColor: "#0f172a",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  caloriesText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  macrosRow: { flexDirection: "row", justifyContent: "space-between" },
  macroCard: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
    marginHorizontal: 2,
    borderWidth: 1,
  },
  macroLabel: { color: "#64748b", fontSize: 9, marginTop: 2 },

  // Estilos del Historial Persistente
  historySection: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    paddingTop: 20,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  historySectionTitle: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  deleteText: { color: "#ef4444", fontSize: 12, fontWeight: "600" },
  emptyHistoryText: {
    color: "#64748b",
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
  historyItemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  historyFoodName: { color: "#fff", fontSize: 13, fontWeight: "600" },
  historyDate: { color: "#64748b", fontSize: 10, marginTop: 2 },
  historyMetrics: { alignItems: "flex-end" },
  historyCal: { color: "#22c55e", fontSize: 13, fontWeight: "bold" },
  historyMacrosMini: { color: "#94a3b8", fontSize: 10, marginTop: 2 },
});
