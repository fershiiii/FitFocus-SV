import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import SplashScreen from "../screens/SplashScreen";
import HomeScreen from "../screens/HomeScreen";
import ExercisesScreen from "../screens/ExercisesScreen";
import DetailScreen from "../screens/DetailScreen";
import CreateRoutineScreen from "../screens/CreateRoutineScreen";
import DietTrackerScreen from "../screens/DietTrackerScreen";
// 🔄 CAMBIO: Importación del nuevo componente de Control de Asistencia
import WorkoutTrackerScreen from "../screens/WorkoutTrackerScreen";
import SearchExercisesScreen from "../screens/SearchExercisesScreen";
import RoutineDetailScreen from "../screens/RoutineDetailScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#0f172a" },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="HomeList"
        component={HomeScreen}
        options={{ title: "FitFocus Hub" }}
      />
      <Stack.Screen
        name="CreateRoutine"
        component={CreateRoutineScreen}
        options={{ title: "Planificador Local" }}
      />
      <Stack.Screen
        name="RoutineDetail"
        component={RoutineDetailScreen}
        options={{ title: "Ejercicios de la Rutina" }}
      />
      <Stack.Screen
        name="ExercisesScreen"
        component={ExercisesScreen}
        options={{ title: "Biblioteca Multimedia" }}
      />
      <Stack.Screen
        name="SearchExercises"
        component={SearchExercisesScreen}
        options={{ title: "Buscador Experto API" }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ title: "Técnica del Ejercicio" }}
      />
    </Stack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#0f172a" },
        headerTintColor: "#ffffff",
        tabBarStyle: {
          backgroundColor: "#0f172a",
          borderTopColor: "#1e293b",
          paddingBottom: 5,
          height: 60,
        },
        tabBarActiveTintColor: "#22c55e",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="ExercisesTab"
        component={HomeStackNavigator}
        options={{
          title: "Inicio",
          headerShown: false,
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="DietTracker"
        component={DietTrackerScreen}
        options={{
          title: "Diario Visual", // 🔄 Ajustado para la idea del BeReal de comidas
          headerShown: true,
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>📸</Text>,
        }}
      />
      <Tab.Screen
        name="WorkoutTracker" // 🔄 CAMBIO: Nombre identificador de la pestaña
        component={WorkoutTrackerScreen} // 🔄 CAMBIO: Componente de Asistencia asignado
        options={{
          title: "Asistencia Gym", // 🔄 CAMBIO: Etiqueta visible en el menú inferior
          headerShown: true,
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🏋️‍♂️</Text>, // 🔄 CAMBIO: Emoji representativo
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="Home" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
