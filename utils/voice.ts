/**
 * Voice & TTS (Text-to-Speech) Utility
 * Uses expo-speech for kid-friendly voice navigation and interactions
 */

import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { log } from './logger';
import { mainStorage, StorageKeys } from './storage';

export interface VoiceSettings {
  enabled: boolean;
  language: string;
  rate: number; // 0.5 to 2.0
  pitch: number; // 0.5 to 2.0
  volume: number; // 0.0 to 1.0
  voice?: string; // Specific voice identifier
}

export interface SpeechOptions {
  priority?: 'high' | 'normal' | 'low';
  interruptible?: boolean;
  onStart?: () => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

// Default kid-friendly voice settings
const DEFAULT_SETTINGS: VoiceSettings = {
  enabled: true,
  language: 'en-US',
  rate: 0.9, // Slightly slower for kids
  pitch: 1.1, // Slightly higher pitch
  volume: 1.0,
};

/**
 * Voice Manager for TTS functionality
 */
class VoiceManager {
  private settings: VoiceSettings;
  private currentSpeech: string | null = null;
  private speechQueue: Array<{ text: string; options?: SpeechOptions }> = [];
  private isSpeaking: boolean = false;
  private availableVoices: Speech.Voice[] = [];

  constructor() {
    this.settings = this.loadSettings();
    this.initializeVoices();
  }

  /**
   * Initialize and load available voices
   */
  private async initializeVoices(): Promise<void> {
    try {
      this.availableVoices = await Speech.getAvailableVoicesAsync();
      log.info(`Loaded ${this.availableVoices.length} available voices`);

      // Find kid-friendly voices (prefer female voices with en-US)
      const kidFriendlyVoices = this.availableVoices.filter(
        (voice) =>
          voice.language.startsWith('en') &&
          (voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('woman') ||
            voice.quality === Speech.VoiceQuality.Enhanced),
      );

      if (kidFriendlyVoices.length > 0 && !this.settings.voice) {
        this.settings.voice = kidFriendlyVoices[0].identifier;
        this.saveSettings();
      }
    } catch (error) {
      log.error('Failed to load voices', error as Error);
    }
  }

  /**
   * Load settings from storage
   */
  private loadSettings(): VoiceSettings {
    return {
      enabled:
        mainStorage.getBoolean(StorageKeys.VOICE_ENABLED, DEFAULT_SETTINGS.enabled) ??
        DEFAULT_SETTINGS.enabled,
      language:
        mainStorage.getString(StorageKeys.VOICE_LANGUAGE, DEFAULT_SETTINGS.language) ??
        DEFAULT_SETTINGS.language,
      rate:
        mainStorage.getNumber(StorageKeys.VOICE_RATE, DEFAULT_SETTINGS.rate) ??
        DEFAULT_SETTINGS.rate,
      pitch:
        mainStorage.getNumber(StorageKeys.VOICE_PITCH, DEFAULT_SETTINGS.pitch) ??
        DEFAULT_SETTINGS.pitch,
      volume: DEFAULT_SETTINGS.volume,
      voice: mainStorage.getString('voice_identifier') ?? undefined,
    };
  }

  /**
   * Save settings to storage
   */
  private saveSettings(): void {
    mainStorage.set(StorageKeys.VOICE_ENABLED, this.settings.enabled);
    mainStorage.set(StorageKeys.VOICE_LANGUAGE, this.settings.language);
    mainStorage.set(StorageKeys.VOICE_RATE, this.settings.rate);
    mainStorage.set(StorageKeys.VOICE_PITCH, this.settings.pitch);
    if (this.settings.voice) {
      mainStorage.set('voice_identifier', this.settings.voice);
    }
  }

  /**
   * Speak text
   */
  async speak(text: string, options?: SpeechOptions): Promise<void> {
    if (!this.settings.enabled) {
      log.debug('Voice is disabled, skipping speech');
      return;
    }

    // Handle priority
    if (options?.priority === 'high' && this.isSpeaking) {
      await this.stop();
    }

    // Queue management
    if (this.isSpeaking && options?.priority !== 'high') {
      if (!options?.interruptible) {
        this.speechQueue.push({ text, options });
        log.debug('Added to speech queue', { queueLength: this.speechQueue.length });
        return;
      } else {
        await this.stop();
      }
    }

    await this.speakInternal(text, options);
  }

  /**
   * Internal speak implementation
   */
  private async speakInternal(text: string, options?: SpeechOptions): Promise<void> {
    try {
      this.isSpeaking = true;
      this.currentSpeech = text;

      const speechOptions: Speech.SpeechOptions = {
        language: this.settings.language,
        pitch: this.settings.pitch,
        rate: this.settings.rate,
        voice: this.settings.voice,
        volume: this.settings.volume,
        onStart: () => {
          log.debug('Speech started', { text: text.substring(0, 50) });
          options?.onStart?.();
        },
        onDone: () => {
          log.debug('Speech completed');
          this.isSpeaking = false;
          this.currentSpeech = null;
          options?.onDone?.();
          this.processQueue();
        },
        onStopped: () => {
          log.debug('Speech stopped');
          this.isSpeaking = false;
          this.currentSpeech = null;
        },
        onError: (error) => {
          log.error('Speech error', error as Error);
          this.isSpeaking = false;
          this.currentSpeech = null;
          options?.onError?.(error as Error);
          this.processQueue();
        },
      };

      await Speech.speak(text, speechOptions);
    } catch (error) {
      log.error('Failed to speak', error as Error);
      this.isSpeaking = false;
      this.currentSpeech = null;
      options?.onError?.(error as Error);
    }
  }

  /**
   * Process queued speech
   */
  private async processQueue(): Promise<void> {
    if (this.speechQueue.length > 0 && !this.isSpeaking) {
      const next = this.speechQueue.shift();
      if (next) {
        await this.speakInternal(next.text, next.options);
      }
    }
  }

  /**
   * Stop current speech
   */
  async stop(): Promise<void> {
    try {
      await Speech.stop();
      this.isSpeaking = false;
      this.currentSpeech = null;
    } catch (error) {
      log.error('Failed to stop speech', error as Error);
    }
  }

  /**
   * Pause speech (if supported)
   */
  async pause(): Promise<void> {
    try {
      await Speech.pause();
    } catch (error) {
      log.error('Failed to pause speech', error as Error);
    }
  }

  /**
   * Resume speech (if supported)
   */
  async resume(): Promise<void> {
    try {
      await Speech.resume();
    } catch (error) {
      log.error('Failed to resume speech', error as Error);
    }
  }

  /**
   * Clear speech queue
   */
  clearQueue(): void {
    this.speechQueue = [];
    log.debug('Speech queue cleared');
  }

  /**
   * Check if currently speaking
   */
  isBusy(): boolean {
    return this.isSpeaking;
  }

  /**
   * Get current speech text
   */
  getCurrentSpeech(): string | null {
    return this.currentSpeech;
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.speechQueue.length;
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): Speech.Voice[] {
    return this.availableVoices;
  }

  /**
   * Update settings
   */
  updateSettings(settings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.saveSettings();
    log.info('Voice settings updated', this.settings);
  }

  /**
   * Get current settings
   */
  getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  /**
   * Toggle voice on/off
   */
  toggle(): boolean {
    this.settings.enabled = !this.settings.enabled;
    this.saveSettings();

    if (!this.settings.enabled) {
      this.stop();
      this.clearQueue();
    }

    return this.settings.enabled;
  }
}

// Singleton instance
export const voiceManager = new VoiceManager();

/**
 * Predefined kid-friendly phrases for common scenarios
 */
export const KidFriendlyPhrases = {
  // Navigation
  nav: {
    turnLeft: 'Turn left up ahead',
    turnRight: 'Turn right at the next corner',
    goStraight: 'Keep going straight',
    arrived: "You've arrived! Great job!",
    starting: "Let's start your journey!",
    almostThere: 'Almost there! Just a little more',
  },

  // Safety
  safety: {
    stayClose: 'Remember to stay close to your grown-up',
    lookBothWays: 'Look both ways before crossing',
    holdHand: "Hold a grown-up's hand while crossing",
    emergency: 'Emergency contact has been notified',
    safeZone: "You're in a safe zone!",
  },

  // Transit
  transit: {
    boarding: 'Time to get on the train! Stay together',
    exiting: 'Almost at your stop. Get ready to exit',
    transfer: 'Time to switch to another train',
    holdOn: 'Hold on tight while the train is moving',
    nextStop: 'Next stop is coming up',
  },

  // Achievements
  achievements: {
    newBadge: 'Wow! You earned a new badge!',
    firstJourney: 'Congratulations on your first journey!',
    safetyChampion: "You're a safety champion!",
    explorer: 'Great job exploring!',
  },

  // General encouragement
  encouragement: {
    goodJob: 'Good job!',
    keepGoing: "You're doing great! Keep going",
    almostDone: "Almost done, you've got this!",
    wellDone: 'Well done!',
  },

  // Errors (kid-friendly)
  errors: {
    noInternet: 'Oops! We need internet to continue',
    locationError: "Can't find your location right now",
    tryAgain: "Let's try that again",
    askGrownup: 'Ask a grown-up for help with this',
  },
};

/**
 * Helper function to speak navigation instructions
 */
export async function speakNavigation(instruction: string, distance?: number): Promise<void> {
  let message = instruction;

  if (distance) {
    if (distance < 50) {
      message = `In a few steps, ${instruction}`;
    } else if (distance < 200) {
      message = `Soon, ${instruction}`;
    } else {
      message = `Up ahead, ${instruction}`;
    }
  }

  await voiceManager.speak(message, { priority: 'high', interruptible: true });
}

/**
 * Helper function to speak safety reminders
 */
export async function speakSafety(message: string): Promise<void> {
  await voiceManager.speak(message, { priority: 'high', interruptible: false });
}

/**
 * Helper function to speak achievements
 */
export async function speakAchievement(achievement: string): Promise<void> {
  await voiceManager.speak(achievement, { priority: 'normal', interruptible: true });
}

/**
 * Helper function to speak general messages
 */
export async function speakMessage(message: string, interruptible = true): Promise<void> {
  await voiceManager.speak(message, { priority: 'normal', interruptible });
}

export default {
  voiceManager,
  KidFriendlyPhrases,
  speakNavigation,
  speakSafety,
  speakAchievement,
  speakMessage,
};
