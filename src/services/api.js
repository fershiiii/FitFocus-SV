const API_URL = "https://wger.de/api/v2/exerciseinfo/?limit=20";

const headers = {
  Authorization: "Token 81b1f4cbe9b3fcc9267ef4007a4dc39326b799d8",
};

export async function getExercises() {
  try {
    const response = await fetch(API_URL, { headers });
    const data = await response.json();

    const exercises = Array.isArray(data.results) ? data.results : [];

    return exercises;
  } catch (error) {
    console.error("Error al obtener ejercicios:", error);
    return [];
  }
}
