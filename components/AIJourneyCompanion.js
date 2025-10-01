import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import Colors from '@/constants/colors';
import { Bot, Volume2, VolumeX, Sparkles } from 'lucide-react-native';
const AIJourneyCompanion = ({ currentLocation, destination, isNavigating }) => {
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [companionMood, setCompanionMood] = useState('happy');
    const pulseAnim = new Animated.Value(1);
    useEffect(() => {
        if (isNavigating && destination) {
            generateJourneyContent();
            startCompanionAnimation();
        }
    }, [isNavigating, destination]);
    const startCompanionAnimation = () => {
        Animated.loop(Animated.sequence([
            Animated.timing(pulseAnim, {
                toValue: 1.2,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
        ])).start();
    };
    const generateJourneyContent = async () => {
        if (!destination)
            return;
        try {
            const response = await fetch('https://toolkit.rork.com/text/llm/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'system',
                            content: `You are Buddy, a friendly AI companion for kids using a navigation app. Create engaging, educational, and safe content for a journey to ${destination.name}. Keep responses short (1-2 sentences), age-appropriate, and encouraging. Focus on interesting facts, safety reminders, or fun observations about the area.`
                        },
                        {
                            role: 'user',
                            content: `I'm traveling to ${destination.name} in ${destination.address}. Tell me something interesting about this area or give me a fun fact to make the journey more exciting!`
                        }
                    ]
                })
            });
            const data = await response.json();
            const newMessage = {
                id: Date.now().toString(),
                text: data.completion,
                type: 'story',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, newMessage]);
            setCurrentMessage(newMessage);
            setCompanionMood('excited');
        }
        catch (error) {
            console.log('AI companion error:', error);
            // Fallback to predefined messages
            const fallbackMessage = {
                id: Date.now().toString(),
                text: `Great choice going to ${destination.name}! I bet you'll discover something amazing there. Stay safe and enjoy your adventure! 🌟`,
                type: 'encouragement',
                timestamp: new Date()
            };
            setCurrentMessage(fallbackMessage);
        }
    };
    const generateQuiz = async () => {
        if (!destination)
            return;
        try {
            const response = await fetch('https://toolkit.rork.com/text/llm/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'system',
                            content: 'Create a simple, fun quiz question for kids about the area they\'re visiting. Make it educational but easy to understand. Include the answer.'
                        },
                        {
                            role: 'user',
                            content: `Create a quiz question about ${destination.name} or the ${destination.category} category in general.`
                        }
                    ]
                })
            });
            const data = await response.json();
            const quizMessage = {
                id: Date.now().toString(),
                text: `🧠 Quiz Time! ${data.completion}`,
                type: 'quiz',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, quizMessage]);
            setCurrentMessage(quizMessage);
            setCompanionMood('curious');
        }
        catch (error) {
            console.log('Quiz generation error:', error);
        }
    };
    const getMoodEmoji = () => {
        switch (companionMood) {
            case 'excited': return '🤩';
            case 'curious': return '🤔';
            default: return '😊';
        }
    };
    if (!isNavigating || !currentMessage) {
        return null;
    }
    return (_jsxs(View, { style: styles.container, children: [_jsxs(Pressable, { style: styles.companionButton, onPress: () => setIsExpanded(!isExpanded), children: [_jsxs(Animated.View, { style: [styles.avatar, { transform: [{ scale: pulseAnim }] }], children: [_jsx(Text, { style: styles.avatarEmoji, children: getMoodEmoji() }), _jsx(Bot, { size: 16, color: Colors.white, style: styles.botIcon })] }), _jsxs(View, { style: styles.messagePreview, children: [_jsx(Text, { style: styles.companionName, children: "Buddy" }), _jsx(Text, { style: styles.messageText, numberOfLines: 1, children: currentMessage.text })] }), _jsx(Pressable, { style: styles.voiceButton, onPress: () => setVoiceEnabled(!voiceEnabled), children: voiceEnabled ? (_jsx(Volume2, { size: 16, color: Colors.primary })) : (_jsx(VolumeX, { size: 16, color: Colors.textLight })) })] }), isExpanded && (_jsxs(View, { style: styles.expandedContent, children: [_jsx(Text, { style: styles.fullMessage, children: currentMessage.text }), _jsxs(View, { style: styles.actionButtons, children: [_jsxs(Pressable, { style: styles.actionButton, onPress: generateQuiz, children: [_jsx(Sparkles, { size: 16, color: Colors.primary }), _jsx(Text, { style: styles.actionButtonText, children: "Quiz Me!" })] }), _jsxs(Pressable, { style: styles.actionButton, onPress: generateJourneyContent, children: [_jsx(Bot, { size: 16, color: Colors.primary }), _jsx(Text, { style: styles.actionButtonText, children: "Tell Me More" })] })] })] }))] }));
};
const styles = StyleSheet.create({
    container: {
        margin: 16,
        backgroundColor: Colors.white,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    companionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        position: 'relative',
    },
    avatarEmoji: {
        fontSize: 20,
        position: 'absolute',
        top: -4,
        right: -4,
    },
    botIcon: {
        opacity: 0.8,
    },
    messagePreview: {
        flex: 1,
    },
    companionName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.primary,
        marginBottom: 2,
    },
    messageText: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 18,
    },
    voiceButton: {
        padding: 8,
    },
    expandedContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    fullMessage: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 20,
        marginBottom: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryLight,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
    },
});
export default AIJourneyCompanion;
