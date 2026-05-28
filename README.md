# FitFocus SV - Fase 2 (Entrega Final)

## Descripción del proyecto
FitFocus SV es una aplicación móvil multiplataforma desarrollada con **React Native** y **Expo**. Su propósito original fue permitir a los usuarios visualizar ejercicios físicos detallados. 

Para esta **Fase 2 (Entrega Final)**, el proyecto se ha ampliado significativamente expandiendo el ecosistema de entrenamiento local mediante la inyección avanzada de APIs REST, almacenamiento híbrido persistente (seguro y local), y la integración de sensores de hardware nativos del dispositivo simulando dinámicas de redes sociales y bitácoras fitness en tiempo real.

---

## 🛠️ Nuevas Funcionalidades Implementadas (Fase 2)

A diferencia de la entrega inicial, se incorporaron los siguientes módulos interactivos exigidos en la rúbrica de evaluación:

1. **Ampliación de Navegación Combinada:**
   * Migración y reestructuración total mediante un enrutador híbrido.
   * Uso de `createNativeStackNavigator` para la pila profunda de pantallas y guías técnicas.
   * Integración de `createBottomTabNavigator` para el menú global inferior interactivo (Inicio, Diario Visual y Asistencia).
   * Implementación exhaustiva de **traspaso de parámetros asíncronos** entre pantallas (`route.params`) para inyectar ejercicios desde la API hacia las rutinas del usuario.

2. **Consumo Avanzado de API REST (ExerciseDB):**
   * Se amplió el consumo integrado conectando endpoints dinámicos de RapidAPI.
   * Inclusión de **Filtros por Categoría Muscular** interactivos (Pecho, Espalda, Piernas, Hombros).
   * **Buscador Experto Global** en tiempo real capaz de mapear y filtrar ejercicios según el tipo de equipamiento físico (*Dumbbell, Barbell, Body weight*).

3. **Almacenamiento Local y Seguro (Persistencia Híbrida):**
   * **Historial Local (`AsyncStorage`):** Guardado persistente del feed de alimentación estilo "BeReal" y el constructor de bloques de entrenamiento. Los datos no se pierden al cerrar el software.
   * **Seguridad Cifrada (`expo-secure-store`):** Encriptación física de la racha de días activos logrados por el usuario dentro del llavero seguro nativo del sistema operativo.

4. **Sensores Nativos y Manejo de Permisos:**
   * **Sensor de Cámara (`expo-camera`):** Gestión y disparo de solicitudes nativas de permisos globales. Implementación de visor interactivo en tiempo real para capturas instantáneas de alimentos.
   * **Sensor de Localización (`expo-location`):** Comprobación e invocación nativa de permisos de posicionamiento en primer plano para validar las estampas cronológicas locales del usuario.

---

## 📂 Estructura Actualizada del Proyecto
src/
├── components/
│   └── ExerciseCard.js          # Tarjeta modular con depuración de HTML por Regex
├── navigation/
│   └── AppNavigator.js          # Enrutador maestro (Tabs + Stacks anidados)
├── screens/
│   ├── SplashScreen.js          # Pantalla de carga con hilos de animación nativa
│   ├── HomeScreen.js            # Hub principal con Widget de agenda semanal
│   ├── CreateRoutineScreen.js   # Diseñador local de entrenamientos
│   ├── RoutineDetailScreen.js   # Visor de ejercicios inyectados en la rutina
│   ├── ExercisesScreen.js       # Biblioteca conectada a la API REST externa
│   ├── SearchExercisesScreen.js # Buscador global avanzado con filtros de accesorios
│   ├── DetailScreen.js          # Guía técnica con renderizado multimedia de GIFs
│   ├── DietTrackerScreen.js     # Diario visual de comidas estilo "BeReal" (Cámara/Gallery)
│   └── WorkoutTrackerScreen.js  # Diario de hábitos (Modal + GPS simulado + SecureStore)
└── services/
└── api.js                   # Consultas asíncronas HTTP a los Endpoints de RapidAPI


---

## 📦 Librerías y Dependencias Utilizadas (Nuevas de Fase 2)

Para habilitar el hardware y almacenamiento nativo se agregaron las siguientes dependencias al ecosistema:

* `@react-native-async-storage/async-storage` - Almacenamiento local persistente en disco.
* `expo-secure-store` - Cifrado seguro de credenciales y rachas en hardware protegido.
* `expo-camera` - Control del lente, captura de fotografías y manejo de permisos de cámara.
* `expo-location` - Acceso a las antenas de posicionamiento global y coordenadas del dispositivo.
* `expo-image` - Decodificador optimizado de alto rendimiento para renderizado de GIFs animados en Android/BlueStacks sin congelamiento de memoria.

---

## 🚀 Instrucciones para Probar las Nuevas Funcionalidades

Para compilar, auditar y testear el proyecto completo en entornos físicos o emuladores (BlueStacks/Android Studio), siga estos pasos:

1. **Instalar Dependencias de Hardware:**
   Instale los módulos nativos ejecutando en la raíz de su terminal:
   ```bash
   npm install
Configurar Variables de Entorno:
Cree un archivo .env en la raíz del proyecto e inyecte sus credenciales de API (Asegúrese de que el archivo .env esté incluido en el .gitignore antes de subir cambios):

Fragmento de código
EXPO_PUBLIC_GEMINI_API_KEY=tu_llave_aqui
Iniciar Servidor de Desarrollo Expo:

Bash
npx expo start
Flujo de Pruebas Recomendado para la Evaluación:

Módulo de Asistencia/Hábitos: Ingrese a la pestaña Asistencia Gym. Presione "Completar Día Actual". Note cómo el sistema operativo despliega los carteles nativos solicitando accesos de Cámara y Ubicación. Ingrese su actividad en el formulario flotante (Modal) y confirme; verá cómo se actualiza la racha protegida por SecureStore de forma inmediata. Cierre la app, vuélvala a abrir y note que los datos persisten.

Módulo Diario Visual: Ingrese a la pestaña Diario Visual. Capture una foto en vivo o elija un archivo de la galería. La app inyectará automáticamente un badge semi-transparente con la estampa exacta de la Hora y Fecha, ordenándolos cronológicamente de forma persistente.

Inyección de Rutinas mediante API REST: En el Inicio, presione "Programar Día" o diríjase al "Diseñador de Entrenamientos". Cree una rutina. Al abrirla, presione "Buscar en la biblioteca API". Seleccione cualquier ejercicio de la lista mediante el botón ➕ y observe cómo se acopla dinámicamente a la persistencia local sin cerrar su navegación de búsqueda.

👥 Integrantes del Equipo
Fernando Aldair Durán Amaya        DA250300

Harold Albeiro Quintanilla Rodriguez  QR241622

Eduardo Josue Ortiz Orellana         OO172577

William Alexander Aviles Del Cid     AD252973

Gabriela Maria Flores Noguera       FN230267
