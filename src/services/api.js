const BASE_URL = "https://exercisedb.p.rapidapi.com";

// 🔐 REPARACIÓN DE SEGURIDAD: Consumimos la llave desde las variables de entorno locales
const RAPID_API_KEY = process.env.EXPO_PUBLIC_RAPID_API_KEY;

const headers = {
  "X-RapidAPI-Key": RAPID_API_KEY,
  "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
};

// Mocks de respaldo por si la API da error de credenciales
const mockFallback = [
  {
    id: "0001",
    name: "BARBELL BENCH PRESS",
    target: "pectorals",
    equipment: "barbell",
    bodyPart: "chest",
    gifUrl: "https://reactnative.dev/img/tiny_logo.png",
    instructions: [
      "Acuéstate en el banco.",
      "Baja la barra al pecho.",
      "Empuja hacia arriba.",
    ],
  },
  {
    id: "0002",
    name: "DUMBBELL BICEP CURL",
    target: "biceps",
    equipment: "dumbbells",
    bodyPart: "arms",
    gifUrl: "https://reactnative.dev/img/tiny_logo.png",
    instructions: [
      "Sostén las mancuernas.",
      "Flexiona los codos.",
      "Baja controlado.",
    ],
  },
  {
    id: "0003",
    name: "LAT PULLDOWN",
    target: "lats",
    equipment: "cable",
    bodyPart: "back",
    gifUrl: "https://reactnative.dev/img/tiny_logo.png",
    instructions: [
      "Sujeta la barra.",
      "Jala hacia tu pecho.",
      "Regresa suave.",
    ],
  },
  {
    id: "0004",
    name: "BARBELL SQUAT",
    target: "glutes",
    equipment: "barbell",
    bodyPart: "upper legs",
    gifUrl: "https://reactnative.dev/img/tiny_logo.png",
    instructions: [
      "Coloca la barra en tus hombros.",
      "Baja la cadera simulando sentarte.",
      "Sube con fuerza.",
    ],
  },
];

export async function listEquipment() {
  try {
    const response = await fetch(`${BASE_URL}/exercises/equipmentList`, {
      method: "GET",
      headers,
    });
    const data = await response.json();
    return Array.isArray(data)
      ? data
      : ["barbell", "dumbbell", "cable", "body weight"];
  } catch (error) {
    return ["barbell", "dumbbell", "cable", "body weight"];
  }
}

export async function getExercisesByCategory(spanishCategory) {
  try {
    let apiBodyPart = "chest";
    if (spanishCategory === "espalda") apiBodyPart = "back";
    else if (spanishCategory === "piernas") apiBodyPart = "upper legs";
    else if (spanishCategory === "hombros") apiBodyPart = "shoulders";

    const response = await fetch(
      `${BASE_URL}/exercises/bodyPart/${apiBodyPart}?limit=15`,
      { method: "GET", headers },
    );
    const data = await response.json();

    if (Array.isArray(data)) {
      return data.map((item) => ({
        id: item.id,
        name: item.name.toUpperCase(),
        category: spanishCategory,
        gifUrl: item.gifUrl,
        equipment: item.equipment,
        target: item.target,
        instructions: item.instructions || [],
      }));
    }

    // Si la API no devolvió un arreglo (ej: error de llave), mandamos el filtro de respaldo
    return mockFallback.filter(
      (ex) =>
        ex.bodyPart === apiBodyPart ||
        (spanishCategory === "pecho" && ex.bodyPart === "chest"),
    );
  } catch (error) {
    return mockFallback;
  }
}

export async function searchExercisesByName(name) {
  try {
    const response = await fetch(
      `${BASE_URL}/exercises/name/${encodeURIComponent(name.toLowerCase())}`,
      { method: "GET", headers },
    );
    const data = await response.json();

    if (Array.isArray(data)) {
      return data;
    }
    // Si da error la API, filtramos del respaldo local por nombre
    return mockFallback.filter((ex) =>
      ex.name.toLowerCase().includes(name.toLowerCase()),
    );
  } catch (error) {
    return mockFallback;
  }
}

export async function listExercisesByEquipment(equipmentName) {
  try {
    const response = await fetch(
      `${BASE_URL}/exercises/equipment/${equipmentName}`,
      { method: "GET", headers },
    );
    const data = await response.json();

    if (Array.isArray(data)) {
      return data;
    }
    return mockFallback.filter((ex) => ex.equipment === equipmentName);
  } catch (error) {
    return mockFallback;
  }
}
