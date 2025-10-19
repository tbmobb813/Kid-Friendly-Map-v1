// Minimal ambient declaration for the 'expo-audio' module used in the project.
// This avoids TypeScript errors in environments where the package is not installed
// (e.g., some CI runners or when running tsc locally without optional native deps).
declare module 'expo-audio' {
  const ExpoAudio: any;
  export = ExpoAudio;
}
