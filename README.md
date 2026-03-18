# FitFocus SV

## Descripción del proyecto

FitFocus SV es una aplicación móvil desarrollada con React Native utilizando Expo. Su propósito es permitir a los usuarios visualizar ejercicios físicos, conocer los músculos que trabajan y acceder a información detallada de cada ejercicio.

La aplicación consume una API pública (wger API) para obtener datos reales de ejercicios, los cuales se muestran en una interfaz clara y organizada.

Este proyecto corresponde a la Fase 1, en la cual se establecen las bases del desarrollo, incluyendo la estructura del proyecto, navegación entre pantallas, consumo de API y diseño inicial.

---

## Objetivos de la Fase 1

En esta fase se desarrollaron los siguientes aspectos:

* Creación del repositorio en GitHub con estructura organizada
* Diseño de la interfaz de usuario en Figma
* Configuración del proyecto con React Native y Expo
* Implementación de navegación entre pantallas
* Consumo de una API REST mediante una petición GET
* Visualización de datos dinámicos en la aplicación

---

## Tecnologías utilizadas

* React Native
* Expo
* JavaScript
* React Navigation
* API REST (wger API)
* Git y GitHub

---

## Estructura del proyecto

El proyecto está organizado en carpetas para facilitar su mantenimiento y comprensión:

```
src/
├── components/
│   └── ExerciseCard.js
├── navigation/
│   └── AppNavigator.js
├── screens/
│   ├── SplashScreen.js
│   ├── HomeScreen.js
│   ├── DetailScreen.js
│   └── ProfileScreen.js
└── services/
    └── api.js
```

### Descripción de carpetas

* components: contiene componentes reutilizables como tarjetas de ejercicios
* screens: contiene las pantallas principales de la aplicación
* navigation: define la navegación entre pantallas
* services: maneja la conexión con la API

---

## Funcionalidades implementadas

* Visualización de ejercicios desde una API externa
* Navegación entre pantallas (Splash, Home, Detail y Profile)
* Visualización de detalles de cada ejercicio
* Uso de imágenes de músculos para representar los ejercicios
* Manejo de estados con useState y useEffect

---

## Consumo de API

Se utiliza la API pública de wger:

https://wger.de/api/v2/exerciseinfo/

La aplicación realiza una petición GET mediante fetch para obtener los datos, los cuales se procesan y muestran en la interfaz.

---

## Dependencias importantes

El proyecto utiliza dependencias adicionales para la navegación:

* @react-navigation/native
* @react-navigation/native-stack
* react-native-screens
* react-native-safe-area-context

Estas dependencias permiten implementar la navegación entre pantallas dentro de la aplicación.

Nota: Todas las dependencias ya se encuentran definidas en el archivo package.json, por lo que se instalan automáticamente al ejecutar npm install.

---

## Instalación y ejecución

1. Clonar el repositorio:

git clone https://github.com/TU-USUARIO/FitFocusSV.git

2. Acceder al proyecto:

cd FitFocusSV

3. Instalar dependencias:

npm install

4. Ejecutar la aplicación:

npx expo start

---

## Integrantes del equipo

* Fernando Aldair Durán Amaya     DA250300
* Harold Albeiro Quintanilla Rodriguez   QR241622
* Eduardo Josue Ortiz Orellana        00172577
* William Alexander Aviles Del Cid    AD252973
* Gabriela Maria Flores Noguera     FN230267

---

## Estado del proyecto

El proyecto se encuentra en desarrollo correspondiente a la Fase 1. Se han implementado las funcionalidades base necesarias para la aplicación.

---

## Posibles mejoras (Fase 2)

* Implementación de filtros por categoría o músculo
* Búsqueda de ejercicios
* Mejora del diseño de la interfaz
* Sistema de favoritos
* Creación de rutinas personalizadas
