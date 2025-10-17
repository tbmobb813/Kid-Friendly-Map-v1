import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Alert, TextInput } from 'react-native';
import Colors from '@/constants/colors';
import { Lock, Eye, EyeOff } from 'lucide-react-native';
const PinAuthentication = ({ onAuthenticated, onCancel, isSettingPin = false, title = 'Parent Mode', subtitle = 'Enter your PIN to access parental controls', }) => {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState('enter');
    const handlePinSubmit = async () => {
        if (pin.length < 4) {
            Alert.alert('Invalid PIN', 'PIN must be at least 4 digits');
            return;
        }
        if (isSettingPin) {
            if (step === 'enter') {
                setStep('confirm');
                return;
            }
            if (pin !== confirmPin) {
                Alert.alert('PIN Mismatch', 'PINs do not match. Please try again.');
                setPin('');
                setConfirmPin('');
                setStep('enter');
                return;
            }
        }
        setIsLoading(true);
        try {
            // In a real app, this would validate against stored PIN
            // For now, we'll simulate authentication
            await new Promise(resolve => setTimeout(resolve, 500));
            onAuthenticated();
        }
        catch (error) {
            Alert.alert('Authentication Failed', 'Invalid PIN. Please try again.');
            setPin('');
            setConfirmPin('');
            setStep('enter');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleNumberPress = (number) => {
        if (step === 'enter') {
            if (pin.length < 6) {
                setPin(prev => prev + number);
            }
        }
        else {
            if (confirmPin.length < 6) {
                setConfirmPin(prev => prev + number);
            }
        }
    };
    const handleBackspace = () => {
        if (step === 'enter') {
            setPin(prev => prev.slice(0, -1));
        }
        else {
            setConfirmPin(prev => prev.slice(0, -1));
        }
    };
    const currentPin = step === 'enter' ? pin : confirmPin;
    const currentTitle = step === 'enter' ? title : 'Confirm PIN';
    const currentSubtitle = step === 'enter' ? subtitle : 'Enter your PIN again to confirm';
    return (_jsxs(View, { style: styles.container, children: [_jsxs(View, { style: styles.header, children: [_jsx(View, { style: styles.iconContainer, children: _jsx(Lock, { size: 32, color: Colors.primary }) }), _jsx(Text, { style: styles.title, children: currentTitle }), _jsx(Text, { style: styles.subtitle, children: currentSubtitle })] }), _jsxs(View, { style: styles.pinContainer, children: [_jsxs(View, { style: styles.pinInputContainer, children: [_jsx(TextInput, { style: styles.pinInput, value: currentPin, onChangeText: step === 'enter' ? setPin : setConfirmPin, placeholder: "Enter PIN", secureTextEntry: !showPin, keyboardType: "numeric", maxLength: 6, textAlign: "center" }), _jsx(Pressable, { style: styles.eyeButton, onPress: () => setShowPin(!showPin), children: showPin ? (_jsx(EyeOff, { size: 20, color: Colors.textLight })) : (_jsx(Eye, { size: 20, color: Colors.textLight })) })] }), _jsx(View, { style: styles.pinDots, children: Array.from({ length: 6 }).map((_, index) => (_jsx(View, { style: [
                                styles.pinDot,
                                index < currentPin.length && styles.pinDotFilled,
                            ] }, index))) })] }), _jsx(View, { style: styles.keypad, children: [
                    ['1', '2', '3'],
                    ['4', '5', '6'],
                    ['7', '8', '9'],
                    ['', '0', '⌫'],
                ].map((row, rowIndex) => (_jsx(View, { style: styles.keypadRow, children: row.map((key, keyIndex) => (_jsx(Pressable, { style: [
                            styles.keypadButton,
                            key === '' && styles.keypadButtonEmpty,
                        ], onPress: () => {
                            if (key === '⌫') {
                                handleBackspace();
                            }
                            else if (key !== '') {
                                handleNumberPress(key);
                            }
                        }, disabled: key === '', children: _jsx(Text, { style: styles.keypadButtonText, children: key }) }, keyIndex))) }, rowIndex))) }), _jsxs(View, { style: styles.actions, children: [_jsx(Pressable, { style: [styles.actionButton, styles.submitButton], onPress: handlePinSubmit, disabled: isLoading || currentPin.length < 4, children: _jsx(Text, { style: styles.submitButtonText, children: isLoading ? 'Verifying...' : step === 'confirm' ? 'Confirm' : 'Submit' }) }), _jsx(Pressable, { style: [styles.actionButton, styles.cancelButton], onPress: onCancel, children: _jsx(Text, { style: styles.cancelButtonText, children: "Cancel" }) })] })] }));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0F4FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textLight,
        textAlign: 'center',
        lineHeight: 22,
    },
    pinContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    pinInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: Colors.border,
    },
    pinInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        letterSpacing: 4,
    },
    eyeButton: {
        padding: 4,
    },
    pinDots: {
        flexDirection: 'row',
        gap: 12,
    },
    pinDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.border,
    },
    pinDotFilled: {
        backgroundColor: Colors.primary,
    },
    keypad: {
        marginBottom: 40,
    },
    keypadRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
        gap: 20,
    },
    keypadButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    keypadButtonEmpty: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
    },
    keypadButtonText: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.text,
    },
    actions: {
        gap: 12,
    },
    actionButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: Colors.primary,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cancelButtonText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
});
export default PinAuthentication;
