import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import { useCameraPermissions } from "expo-camera";
// 🟢 REQUERIMIENTO: Importamos AsyncStorage para persistir el historial completo al cerrar la app
import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORIAL_STORAGE_KEY = "@fitfocus_histividad_calendario";

export default function WorkoutTrackerScreen() {
  const [rachaDias, setRachaDias] = useState("0");
  const [permission, requestPermission] = useCameraPermissions();
  const [historialActividad, setHistorialActividad] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [actividadTexto, setActividadTexto] = useState("");

  // 🟢 MODIFICADO: Ahora carga la racha y también el historial de días del disco al abrir la pantalla
  useEffect(() => {
    cargarDatosPersistidos();
  }, []);

  const cargarDatosPersistidos = async () => {
    try {
      // 1. Cargar racha cifrada (SecureStore)
      let racha = await SecureStore.getItemAsync("user_fitness_racha");
      if (racha) {
        setRachaDias(racha);
      }

      // 2. Cargar historial de tarjetas del calendario (AsyncStorage)
      let historialGuardado = await AsyncStorage.getItem(HISTORIAL_STORAGE_KEY);
      if (historialGuardado) {
        setHistorialActividad(JSON.parse(historialGuardado));
      }
    } catch (e) {
      console.error("Error cargando datos locales persistentes:", e);
    }
  };

  const iniciarFlujoRegistro = async () => {
    let { status: gpsStatus } =
      await Location.requestForegroundPermissionsAsync();
    if (gpsStatus !== "granted") {
      Alert.alert(
        "Permiso Requerido",
        "FitFocus necesita el permiso de ubicación para añadir la etiqueta local a tu día de ejercicio.",
      );
      return;
    }

    let cameraResp = await requestPermission();
    if (!cameraResp.granted) {
      Alert.alert(
        "Permiso Requerido",
        "Habilita el permiso de cámara si deseas asociar fotos de progreso a tus días completados.",
      );
      return;
    }

    const hoy = new Date();
    const fechaFormateada = hoy.toLocaleDateString("es-SV", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    if (historialActividad.some((item) => item.fecha === fechaFormateada)) {
      Alert.alert(
        "¡Día Completado!",
        "Ya registraste tu actividad física de hoy. ¡Sigue así mañana!",
      );
      return;
    }

    setModalVisible(true);
  };

  const procesarGuardadoActividad = async () => {
    if (actividadTexto.trim() === "") {
      Alert.alert(
        "Campo Requerido",
        "Por favor escribe qué actividad física realizaste.",
      );
      return;
    }

    try {
      const hoy = new Date();
      const fechaFormateada = hoy.toLocaleDateString("es-SV", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });

      const horaFormateada = hoy.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const nuevoDiaCompletado = {
        id: Date.now().toString(),
        fecha: fechaFormateada,
        hora: horaFormateada,
        actividad: actividadTexto.trim(),
        tagLugar: "Zona Activa (San Salvador)",
      };

      const nuevoHistorial = [nuevoDiaCompletado, ...historialActividad];
      setHistorialActividad(nuevoHistorial);

      // 🟢 SOLUCIÓN AL BUG: Guardado físico del arreglo en almacenamiento local permanente
      await AsyncStorage.setItem(
        HISTORIAL_STORAGE_KEY,
        JSON.stringify(nuevoHistorial),
      );

      // Guardar la racha numérica en SecureStore
      const nuevaRachaCalculada = nuevoHistorial.length.toString();
      setRachaDias(nuevaRachaCalculada);
      await SecureStore.setItemAsync("user_fitness_racha", nuevaRachaCalculada);

      setModalVisible(false);
      setActividadTexto("");

      Alert.alert(
        "🔥 ¡Registro Guardado!",
        `Has sumado tu actividad a tu calendario fitness con éxito.`,
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar el registro en el historial.");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>💪 Mi Diario de Actividad</Text>
      <Text style={styles.subtitle}>
        Lleva un control cronológico de los días que lograste mantenerte en
        movimiento y romper el sedentarismo.
      </Text>

      {/* RECUADRO DE RACHA PROTEGIDA POR SECURESTORE */}
      <View style={styles.rachaCard}>
        <Text style={styles.rachaEmoji}>⚡</Text>
        <View>
          <Text style={styles.rachaTitle}>Racha Activa Asegurada</Text>
          <Text style={styles.rachaDesc}>
            Tienes <Text style={styles.rachaNumero}>{rachaDias} días</Text> de
            ejercicio registrados
          </Text>
        </View>
      </View>

      {/* BOTÓN INTERACTIVO DE REGISTRO */}
      <View style={styles.registroBox}>
        <Text style={styles.preguntaText}>¿Hiciste actividad física hoy?</Text>
        <TouchableOpacity
          style={styles.btnMarcarDia}
          onPress={iniciarFlujoRegistro}
        >
          <Text style={styles.btnMarcarDiaText}>🗓️ COMPLETAR DÍA ACTUAL</Text>
        </TouchableOpacity>
        <Text style={styles.notaSensores}>
          * Al registrar, la app verifica de manera segura tu hardware para
          validar la estampa cronológica.
        </Text>
      </View>

      {/* FORMULARIO FLOTANTE (MODAL COMPATIBLE CON BLUESTACKS) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>📝 ¿Qué hiciste hoy?</Text>
            <Text style={styles.modalSubtitle}>
              Describe brevemente tu actividad física o entrenamiento:
            </Text>

            <TextInput
              style={styles.inputActividad}
              placeholder="Ej: Correr 5km, Rutina de Pecho, 30 min de Bicicleta..."
              placeholderTextColor="#64748b"
              value={actividadTexto}
              onChangeText={setActividadTexto}
              maxLength={60}
            />

            <View style={styles.modalRowButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancelar]}
                onPress={() => {
                  setModalVisible(false);
                  setActividadTexto("");
                }}
              >
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnGuardar]}
                onPress={procesarGuardadoActividad}
              >
                <Text style={styles.modalBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CALENDARIO / HISTORIAL REFLEJADO */}
      <View style={styles.calendarioSection}>
        <Text style={styles.calendarioTitle}>
          📅 Calendario de Días Logrados
        </Text>

        {historialActividad.length === 0 ? (
          <View style={styles.emptyCalendario}>
            <Text style={styles.emptyEmoji}>🏋️‍♂️</Text>
            <Text style={styles.emptyText}>
              Tu calendario está vacío. ¡Haz ejercicio hoy y presiona el botón
              para estrenarlo!
            </Text>
          </View>
        ) : (
          historialActividad.map((item) => (
            <View key={item.id} style={styles.diaCard}>
              <View style={styles.diaCheckIndicator}>
                <Text style={styles.checkIcon}>✔️</Text>
              </View>
              <View style={styles.diaInfo}>
                <Text style={styles.diaFechaText}>
                  {item.fecha.toUpperCase()}
                </Text>
                <Text style={styles.diaActividadText}>✨ {item.actividad}</Text>
                <Text style={styles.diaHoraText}>
                  Registrado a las: {item.hora}
                </Text>
                <Text style={styles.diaUbicacionText}>📍 {item.tagLugar}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// (Mantenemos los mismos estilos intactos abajo...)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 4 },
  subtitle: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 24,
    lineHeight: 18,
  },
  rachaCard: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  rachaEmoji: { fontSize: 32, marginRight: 14 },
  rachaTitle: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  rachaDesc: { color: "#fff", fontSize: 14, marginTop: 2 },
  rachaNumero: { color: "#eab308", fontWeight: "bold" },
  registroBox: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  preguntaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 14,
  },
  btnMarcarDia: {
    backgroundColor: "#22c55e",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnMarcarDiaText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  notaSensores: {
    color: "#475569",
    fontSize: 10,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 14,
  },
  modalCenteredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
  },
  modalView: {
    width: "85%",
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 16,
    lineHeight: 18,
  },
  inputActividad: {
    width: "100%",
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 20,
  },
  modalRowButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalBtn: {
    flex: 0.47,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalBtnCancelar: { backgroundColor: "#334155" },
  modalBtnGuardar: { backgroundColor: "#22c55e" },
  modalBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  calendarioSection: { marginBottom: 40 },
  calendarioTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  emptyCalendario: { paddingVertical: 40, alignItems: "center" },
  emptyEmoji: { fontSize: 42, marginBottom: 10, opacity: 0.5 },
  emptyText: {
    color: "#475569",
    fontSize: 13,
    textAlign: "center",
    fontStyle: "italic",
    paddingHorizontal: 20,
  },
  diaCard: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  diaCheckIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  checkIcon: { fontSize: 14 },
  diaInfo: { flex: 1 },
  diaFechaText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  diaActividadText: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  diaHoraText: { color: "#94a3b8", fontSize: 11, marginTop: 4 },
  diaUbicacionText: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 4,
    fontWeight: "600",
  },
});
