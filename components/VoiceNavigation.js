import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, Pressable, Platform } from "react-native";
import Colors from "@/constants/colors";
import { Mic, Volume2 } from "lucide-react-native";
import * as Speech from "expo-speech";
import { Audio } from "@/utils/expoAudioBridge";
import { useToast } from "@/hooks/useToast";
const VoiceNavigation = ({ currentStep = "Walk to Main Street Station", onVoiceCommand, testId, }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [errorMsg, setErrorMsg] = useState(null);
    const recordingRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const chunksRef = useRef([]);
    const { showToast } = useToast();
    const speak = useCallback(async (text) => {
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
        }
        catch {
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
            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };
            mediaRecorder.start();
            setIsListening(true);
        }
        catch {
            setErrorMsg("Microphone access denied");
            showToast("Mic permission denied", "error");
        }
    }, [showToast]);
    const stopRecordingWeb = useCallback(async () => {
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
            }
            else {
                resolve(null);
            }
            setIsListening(false);
        });
    }, []);
    const startRecordingNative = useCallback(async () => {
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const RecordingClass = Audio.Recording || function () { };
            const recording = new RecordingClass();
            // Use broader any for options to avoid strict expo-av type mismatches
            const options = {
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
            };
            await recording.prepareToRecordAsync(options);
            await recording.startAsync();
            recordingRef.current = recording;
            setIsListening(true);
        }
        catch {
            setErrorMsg("Could not start recording");
            showToast("Recording failed to start", "error");
        }
    }, [showToast]);
    const stopRecordingNative = useCallback(async () => {
        try {
            const rec = recordingRef.current;
            if (!rec)
                return null;
            await rec.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
            const uri = rec.getURI();
            recordingRef.current = null;
            setIsListening(false);
            return uri ?? null;
        }
        catch {
            setErrorMsg("Failed to stop recording");
            return null;
        }
    }, []);
    const startListening = useCallback(async () => {
        setErrorMsg(null);
        if (Platform.OS === "web") {
            await startRecordingWeb();
        }
        else {
            await startRecordingNative();
        }
    }, [startRecordingNative, startRecordingWeb]);
    const transcribe = useCallback(async (payload) => {
        const form = new FormData();
        if (Platform.OS === "web") {
            if (payload.blob) {
                const file = new File([payload.blob], "recording.webm", { type: "audio/webm" });
                form.append("audio", file);
            }
        }
        else if (payload.uri) {
            const uri = payload.uri;
            const ext = uri.split(".").pop() ?? "m4a";
            // FormData typing in React Native differs; cast to any for now
            form.append("audio", {
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
                if (!res.ok)
                    throw new Error(`HTTP ${res.status}`);
                const json = (await res.json());
                setTranscript(json.text);
                onVoiceCommand?.(json.text);
                showToast("Heard: " + json.text, "success");
                return;
            }
            catch {
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
                if (blob)
                    await transcribe({ blob });
            }
            else {
                const uri = await stopRecordingNative();
                if (uri)
                    await transcribe({ uri });
            }
        }
        catch {
            setErrorMsg("Something went wrong processing audio");
        }
    }, [stopRecordingNative, stopRecordingWeb, transcribe]);
    useEffect(() => {
        return () => {
            if (Platform.OS === "web") {
                mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
                try {
                    mediaRecorderRef.current?.stop?.();
                }
                catch { }
            }
        };
    }, []);
    return (_jsxs(View, { style: styles.container, testID: testId ?? "voice-nav", children: [_jsxs(View, { style: styles.stepContainer, children: [_jsx(Text, { style: styles.stepText, children: currentStep }), transcript ? _jsxs(Text, { style: styles.subtle, children: ["You said: ", transcript] }) : null, errorMsg ? _jsx(Text, { style: styles.errorText, children: errorMsg }) : null] }), _jsxs(View, { style: styles.controlsContainer, children: [_jsxs(Pressable, { testID: "ptt-button", style: [styles.voiceButton, isListening && styles.listeningButton], onPressIn: startListening, onPressOut: stopAndTranscribe, children: [_jsx(Mic, { size: 24, color: "#FFFFFF" }), _jsx(Text, { style: styles.buttonText, children: isListening ? "Listening..." : "Push to talk" })] }), _jsxs(Pressable, { testID: "repeat-button", style: [styles.speakButton, isSpeaking && styles.speakingButton], onPress: handleRepeat, children: [_jsx(Volume2, { size: 24, color: "#FFFFFF" }), _jsx(Text, { style: styles.buttonText, children: isSpeaking ? "Speaking..." : "Repeat" })] })] }), isListening && (_jsxs(View, { style: styles.commandsContainer, children: [_jsx(Text, { style: styles.commandsTitle, children: "Say things like:" }), _jsx(Text, { style: styles.commandText, children: "\u2022 \"Where am I?\"" }), _jsx(Text, { style: styles.commandText, children: "\u2022 \"Repeat directions\"" }), _jsx(Text, { style: styles.commandText, children: "\u2022 \"Call for help\"" }), _jsx(Text, { style: styles.commandText, children: "\u2022 \"How much time left?\"" })] }))] }));
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
