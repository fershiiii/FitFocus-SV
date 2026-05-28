import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@fitfocus_diario_bereal";
const { width } = Dimensions.get("window");

export default function DietTrackerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [saving, setSaving] = useState(false);

  // Lista de momentos/fotos guardadas
  const [momentsList, setMomentsList] = useState([]);
  const cameraRef = useRef(null);

  // Cargar las fotos guardadas al iniciar la pantalla
  useEffect(() => {
    cargarDiarioLocal();
  }, []);

  const cargarDiarioLocal = async () => {
    try {
      const datosGuardados = await AsyncStorage.getItem(STORAGE_KEY);
      if (datosGuardados) {
        setMomentsList(JSON.parse(datosGuardados));
      }
    } catch (error) {
      console.error("Error cargando el diario visual:", error);
    }
  };

  // Función para registrar una nueva foto con su estampa de tiempo
  const guardarMomentoFoto = async (uri) => {
    try {
      setSaving(true);

      const nuevoMomento = {
        id: Date.now().toString(),
        imageUri: uri,
        fecha: new Date().toLocaleDateString("es-SV", {
          weekday: "long",
          day: "numeric",
          month: "short",
        }),
        hora: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const nuevoHistorial = [nuevoMomento, ...momentsList];
      setMomentsList(nuevoHistorial);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevoHistorial));
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la captura en el diario.");
    } finally {
      setSaving(false);
    }
  };

  // Buscar foto de la galería
  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permiso Denegado", "Se necesita acceso a tus fotos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1], // Formato cuadrado tipo red social
        quality: 0.6,
      });

      if (result.canceled) return;

      await guardarMomentoFoto(result.assets[0].uri);
    } catch (e) {
      Alert.alert("Error", "No se pudo cargar la imagen.");
    }
  };

  // Tomar foto con la cámara en vivo
  const handleTakePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const options = { quality: 0.6, skipProcessing: false };
      const photo = await cameraRef.current.takePictureAsync(options);

      setIsCameraActive(false);
      await guardarMomentoFoto(photo.uri);
    } catch (e) {
      Alert.alert("Error", "No se pudo capturar la fotografía.");
    }
  };

  const limpiarHistorial = async () => {
    Alert.alert(
      "Vaciar Diario Visual",
      "¿Seguro que quieres borrar todos tus momentos de comida?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar todo",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(STORAGE_KEY);
              setMomentsList([]);
            } catch (error) {
              console.error(error);
            }
          },
        },
      ],
    );
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
        <Text style={styles.title}>📸 Diario de Comidas</Text>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionText}>
            FitFocus necesita acceso a la cámara y almacenamiento para capturar
            tus platillos diarios en tiempo real.
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
      <Text style={styles.title}>📸 Momentos de Comida</Text>
      <Text style={styles.subtitle}>
        Un registro visual diario de lo que comes, al puro estilo BeReal.
      </Text>

      {/* CONTROL DE CÁMARA EN VIVO */}
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
                    style={{ color: "#fff", fontSize: 13, fontWeight: "bold" }}
                  >
                    ✖ Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.captureCircleBtn}
                  onPress={handleTakePicture}
                />
                <View style={{ width: 70 }} />
              </View>
            </View>
          </CameraView>
        </View>
      ) : (
        <View style={styles.actionBox}>
          {saving ? (
            <ActivityIndicator size="large" color="#22c55e" />
          ) : (
            <View style={styles.rowButtons}>
              <TouchableOpacity
                style={styles.btnMain}
                onPress={() => setIsCameraActive(true)}
              >
                <Text style={styles.btnText}>📷 Capturar Ahora</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnMain, styles.btnSecondary]}
                onPress={handlePickImage}
              >
                <Text style={[styles.btnText, { color: "#38bdf8" }]}>
                  📂 Subir Foto
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* FEED ESTILO BEREAL / CALENDARIO CRONOLÓGICO */}
      <View style={styles.historySection}>
        <View style={styles.historyHeader}>
          <Text style={styles.historySectionTitle}>📅 Tu Historial Visual</Text>
          {momentsList.length > 0 && (
            <TouchableOpacity onPress={limpiarHistorial}>
              <Text style={styles.deleteText}>Vaciar Diario</Text>
            </TouchableOpacity>
          )}
        </View>

        {momentsList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.cameraIcon}>🍽️</Text>
            <Text style={styles.emptyHistoryText}>
              No has capturado ninguna comida hoy.
            </Text>
          </View>
        ) : (
          <View style={styles.feedContainer}>
            {momentsList.map((item) => (
              <View key={item.id} style={styles.berealCard}>
                {/* Contenedor de la Imagen */}
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.berealImage}
                />

                {/* Estampa de tiempo superpuesta (Estilo BeReal) */}
                <View style={styles.timestampBadge}>
                  <Text style={styles.badgeTimeText}>{item.hora}</Text>
                  <Text style={styles.badgeDateText}>{item.fecha}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0f19", padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0b0f19",
  },

  permissionBox: {
    backgroundColor: "#1e293b",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 40,
  },
  permissionText: {
    color: "#cbd5e1",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  btnPermission: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  btnPermissionText: { color: "#fff", fontWeight: "bold", fontSize: 14 },

  actionBox: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    borderHorizontalWidth: 1,
    borderColor: "#1f2937",
  },
  rowButtons: { flexDirection: "row", justifyContent: "space-between" },
  btnMain: {
    flex: 1,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#22c55e",
    alignItems: "center",
    marginRight: 8,
  },
  btnSecondary: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    borderColor: "#38bdf8",
    marginRight: 0,
    marginLeft: 8,
  },
  btnText: { color: "#22c55e", fontWeight: "700", fontSize: 14 },

  cameraContainer: {
    width: "100%",
    height: width - 32,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#374151",
  },
  camera: { flex: 1 },
  overlayContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  scanTargetFrame: {
    width: width - 100,
    height: width - 100,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    borderRadius: 20,
    borderStyle: "dashed",
  },
  cameraActionRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  btnCancelCam: {
    backgroundColor: "rgba(239, 68, 68, 0.85)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  captureCircleBtn: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#fff",
    borderWidth: 5,
    borderColor: "#22c55e",
  },

  historySection: { marginTop: 25 },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  historySectionTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  deleteText: { color: "#ef4444", fontSize: 13, fontWeight: "650" },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  cameraIcon: { fontSize: 50, marginBottom: 10 },
  emptyHistoryText: { color: "#475569", fontSize: 13, fontStyle: "italic" },

  feedContainer: { gap: 20 },
  berealCard: {
    width: "100%",
    height: width - 32,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#111827",
    position: "relative",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  berealImage: { width: "100%", height: "100%", resizeMode: "cover" },

  timestampBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  badgeTimeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  badgeDateText: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginTop: 1,
  },
});
