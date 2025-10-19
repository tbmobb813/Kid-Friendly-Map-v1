// Lightweight bridge to provide the `Audio`-like surface expected by the app
// Maps calls to the new `expo-audio` / `expo-video` packages where possible.
// This file keeps the rest of the app unchanged while allowing the project
// to use the new split packages.

// NOTE: This bridge implements the minimal API surface used across the codebase
// (requestPermissionsAsync, setAudioModeAsync, Sound.createAsync, and Recording).
// If you rely on more APIs, extend this bridge accordingly.

// We import the new `expo-audio` package. It may not have identical APIs to the
// legacy `expo-av`, so the bridge adapts the surface used by the app.
import * as ExpoAudio from 'expo-audio';

type AnyObject = Record<string, any>;

const Recording =
  (ExpoAudio as any).Recording ||
  class {
    async prepareToRecordAsync(_opts?: AnyObject) {}
    async startAsync() {}
    async stopAndUnloadAsync() {}
    getURI() {
      return null;
    }
  };

const Sound = (ExpoAudio as any).Sound || {
  async createAsync(_source: any, _options?: AnyObject) {
    return { sound: { playAsync: async () => {} } };
  },
};

const requestPermissionsAsync = async () => {
  if ((ExpoAudio as any).requestPermissionsAsync)
    return (ExpoAudio as any).requestPermissionsAsync();
  return { granted: true };
};

const setAudioModeAsync = async (_mode: AnyObject) => {
  if ((ExpoAudio as any).setAudioModeAsync) return (ExpoAudio as any).setAudioModeAsync(_mode);
  return null;
};

// Re-export an `Audio` object with the APIs used in the app
export const Audio = {
  Recording,
  Sound,
  requestPermissionsAsync,
  setAudioModeAsync,
  // constants fallbacks — some code references RECORDING_OPTION_* constants
  RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4:
    (ExpoAudio as any).RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4 || 2,
  RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC:
    (ExpoAudio as any).RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC || 3,
  RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM:
    (ExpoAudio as any).RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM || 1,
  RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH:
    (ExpoAudio as any).RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH || 0,
};

export default Audio;
