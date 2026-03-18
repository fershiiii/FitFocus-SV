import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Image, View } from "react-native";

import SplashScreen from "../screens/SplashScreen";
import HomeScreen from "../screens/HomeScreen";
import DetailScreen from "../screens/DetailScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#0f172a",
          },
          headerTintColor: "#ffffff",
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerTitle: () => (
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "#1e293b",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                  borderWidth: 2,
                  borderColor: "#22c55e",
                }}
              >
                <Image
                  source={require("../../assets/logo.png")}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
              </View>
            ),
          }}
        />

        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{
            title: "Ejercicio",
          }}
        />

        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: "Perfil",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
