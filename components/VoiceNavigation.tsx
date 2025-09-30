import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, Pressable, Platform } from "react-native";
import Colors from "@/constants/colors";
import { Mic, Volume2 } from "lucide-react-native";
import * as Speech from "expo-speech";
import { Audio, Recording } from "expo-av";
import { useToast } from "@/hooks/useToast";

type VoiceNavigationProps = {
  currentStep?: string;
  onVoiceCommand?: (command: string) => void;
  testId?: string;
};

type STTResponse = { text: string; language: string };

const VoiceNavigation: React.FC<VoiceNavigationProps> = ({
  currentStep = "Walk to Main Street Station",
  onVoiceCommand,
  testId,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recordingRef = useRef<Recording | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const { showToast } = useToast();

  const speak = useCallback(async (text: string) => {
    try {
      setIsSpeaking(true);
      Speech.stop();
      await Speech.speak(text, {
        language: "en-US",
        rate: 1.0,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch {
      setIsSpeaking(false);
      showToast("Unable to speak right now", "warning");
    }
  }, [showToast]);

  const handleRepeat = useCallback(() => {
    speak(currentStep);
  }, [currentStep, speak]);

  const startRecordingWeb = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      mediaRecorder.start();
      setIsListening(true);
    } catch {
      setErrorMsg("Microphone access denied");
      showToast("Mic permission denied", "error");
    }
  }, [showToast]);

  const stopRecordingWeb = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const mr = mediaRecorderRef.current;
      const stream = mediaStreamRef.current;
      if (!mr) {
        resolve(null);
        return;
      }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        stream?.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current = null;
        mediaStreamRef.current = null;
        resolve(blob);
      };
      if (mr.state !== "inactive") {
        mr.stop();
      } else {
        resolve(null);
      }
      setIsListening(false);
    });
  }, []);

  const startRecordingNative = useCallback(async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: ".m4a",
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
        },
        ios: {
          extension: ".wav",
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
        },
      });
      await recording.startAsync();
      recordingRef.current = recording;
      setIsListening(true);
    } catch {
      setErrorMsg("Could not start recording");
      showToast("Recording failed to start", "error");
    }
  }, [showToast]);

  const stopRecordingNative = useCallback(async (): Promise<string | null> => {
    try {
      const rec = recordingRef.current;
      if (!rec) return null;
      await rec.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = rec.getURI();
      recordingRef.current = null;
      setIsListening(false);
      return uri ?? null;
    } catch {
      setErrorMsg("Failed to stop recording");
      return null;
    }
  }, []);

  const startListening = useCallback(async () => {
    setErrorMsg(null);
    if (Platform.OS === "web") {
      await startRecordingWeb();
    } else {
      await startRecordingNative();
    }
  }, [startRecordingNative, startRecordingWeb]);

  const transcribe = useCallback(async (payload: { blob?: Blob; uri?: string }) => {
    const form = new FormData();
    if (Platform.OS === "web") {
      if (payload.blob) {
        const file = new File([payload.blob], "recording.webm", { type: "audio/webm" });
        form.append("audio", file);
      }
    } else if (payload.uri) {
      const uri = payload.uri;
      const ext = uri.split(".").pop() ?? "m4a";
      form.append("audio", {
        // @ts-expect-error React Native FormData file
        uri,
        name: `recording.${ext}`,
        type: `audio/${ext}`,
      });
    }
    let attempts = 0;
    const max = 2;
    while (attempts <= max) {
      try {
        const res = await fetch("https://toolkit.rork.com/stt/transcribe/", {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as STTResponse;
        setTranscript(json.text);
        onVoiceCommand?.(json.text);
        showToast("Heard: " + json.text, "success");
        return;
      } catch {
        attempts += 1;
        if (attempts > max) {
          setErrorMsg("Transcription failed. Please try again.");
          showToast("Transcription failed", "error");
          return;
        }
        await new Promise((r) => setTimeout(r, 600 * attempts));
      }
    }
  }, [onVoiceCommand, showToast]);

  const stopAndTranscribe = useCallback(async () => {
    try {
      if (Platform.OS === "web") {
        const blob = await stopRecordingWeb();
        if (blob) await transcribe({ blob });
      } else {
        const uri = await stopRecordingNative();
        if (uri) await transcribe({ uri });
      }
    } catch {
      setErrorMsg("Something went wrong processing audio");
    }
  }, [stopRecordingNative, stopRecordingWeb, transcribe]);

  useEffect(() => {
    return () => {
      if (Platform.OS === "web") {
        mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
        try {
          mediaRecorderRef.current?.stop?.();
        } catch {}
      }
    };
  }, []);

  return (
    <View style={styles.container} testID={testId ?? "voice-nav"}>
      <View style={styles.stepContainer}>
        <Text style={styles.stepText}>{currentStep}</Text>
        {transcript ? <Text style={styles.subtle}>You said: {transcript}</Text> : null}
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
      </View>

      <View style={styles.controlsContainer}>
        <Pressable
          testID="ptt-button"
          style={[styles.voiceButton, isListening && styles.listeningButton]}
          onPressIn={startListening}
          onPressOut={stopAndTranscribe}
        >
          <Mic size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>{isListening ? "Listening..." : "Push to talk"}</Text>
        </Pressable>

        <Pressable
          testID="repeat-button"
          style={[styles.speakButton, isSpeaking && styles.speakingButton]}
          onPress={handleRepeat}
        >
          <Volume2 size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>{isSpeaking ? "Speaking..." : "Repeat"}</Text>
        </Pressable>
      </View>

      {isListening && (
        <View style={styles.commandsContainer}>
          <Text style={styles.commandsTitle}>Say things like:</Text>
          <Text style={styles.commandText}>• "Where am I?"</Text>
          <Text style={styles.commandText}>• "Repeat directions"</Text>
          <Text style={styles.commandText}>• "Call for help"</Text>
          <Text style={styles.commandText}>• "How much time left?"</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  stepContainer: {
    backgroundColor: "#F0F4FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  stepText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
  },
  subtle: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.textLight,
    textAlign: "center",
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.error,
    textAlign: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 16,
  },
  voiceButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  listeningButton: {
    backgroundColor: Colors.error,
  },
  speakButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  speakingButton: {
    backgroundColor: Colors.warning,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  commandsContainer: {
    marginTop: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 12,
  },
  commandsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  commandText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
});

export default VoiceNavigation;
