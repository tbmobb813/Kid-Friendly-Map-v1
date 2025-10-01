import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail, isValidPassword } from '@/utils/auth';
import Colors from '@/constants/colors';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';
export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        role: 'user'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login, register, error, clearError } = useAuth();
    const handleSubmit = async () => {
        clearError();
        // Validation
        if (!isValidEmail(formData.email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address');
            return;
        }
        if (!isLogin) {
            if (!formData.name.trim()) {
                Alert.alert('Name Required', 'Please enter your name');
                return;
            }
            const passwordValidation = isValidPassword(formData.password);
            if (!passwordValidation.isValid) {
                Alert.alert('Invalid Password', passwordValidation.errors.join('\n'));
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                Alert.alert('Password Mismatch', 'Passwords do not match');
                return;
            }
        }
        setIsLoading(true);
        try {
            let result;
            if (isLogin) {
                result = await login({
                    email: formData.email,
                    password: formData.password,
                    rememberMe: true
                });
            }
            else {
                result = await register({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    role: formData.role
                });
            }
            if (result.success) {
                // Navigation will be handled by the auth state change
                router.replace('/(tabs)');
            }
            else {
                Alert.alert(isLogin ? 'Login Failed' : 'Registration Failed', result.error || 'Please try again');
            }
        }
        catch (err) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const toggleMode = () => {
        setIsLogin(!isLogin);
        clearError();
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            name: '',
            role: 'user'
        });
    };
    return (_jsx(SafeAreaView, { style: styles.container, children: _jsx(KeyboardAvoidingView, { behavior: Platform.OS === 'ios' ? 'padding' : 'height', style: styles.keyboardView, children: _jsxs(ScrollView, { contentContainerStyle: styles.scrollContent, keyboardShouldPersistTaps: "handled", children: [_jsxs(View, { style: styles.header, children: [_jsx(Text, { style: styles.title, children: isLogin ? 'Welcome Back' : 'Create Account' }), _jsx(Text, { style: styles.subtitle, children: isLogin
                                    ? 'Sign in to continue your journey'
                                    : 'Join us for safer travels' })] }), _jsxs(View, { style: styles.form, children: [!isLogin && (_jsxs(View, { style: styles.inputContainer, children: [_jsx(User, { size: 20, color: Colors.textSecondary, style: styles.inputIcon }), _jsx(TextInput, { style: styles.input, placeholder: "Full Name", placeholderTextColor: Colors.textSecondary, value: formData.name, onChangeText: (text) => setFormData(prev => ({ ...prev, name: text })), autoCapitalize: "words", testID: "name-input" })] })), _jsxs(View, { style: styles.inputContainer, children: [_jsx(Mail, { size: 20, color: Colors.textSecondary, style: styles.inputIcon }), _jsx(TextInput, { style: styles.input, placeholder: "Email Address", placeholderTextColor: Colors.textSecondary, value: formData.email, onChangeText: (text) => setFormData(prev => ({ ...prev, email: text })), keyboardType: "email-address", autoCapitalize: "none", autoCorrect: false, testID: "email-input" })] }), _jsxs(View, { style: styles.inputContainer, children: [_jsx(Lock, { size: 20, color: Colors.textSecondary, style: styles.inputIcon }), _jsx(TextInput, { style: [styles.input, styles.passwordInput], placeholder: "Password", placeholderTextColor: Colors.textSecondary, value: formData.password, onChangeText: (text) => setFormData(prev => ({ ...prev, password: text })), secureTextEntry: !showPassword, autoCapitalize: "none", autoCorrect: false, testID: "password-input" }), _jsx(Pressable, { style: styles.eyeButton, onPress: () => setShowPassword(!showPassword), testID: "toggle-password-visibility", children: showPassword ? (_jsx(EyeOff, { size: 20, color: Colors.textSecondary })) : (_jsx(Eye, { size: 20, color: Colors.textSecondary })) })] }), !isLogin && (_jsxs(View, { style: styles.inputContainer, children: [_jsx(Lock, { size: 20, color: Colors.textSecondary, style: styles.inputIcon }), _jsx(TextInput, { style: [styles.input, styles.passwordInput], placeholder: "Confirm Password", placeholderTextColor: Colors.textSecondary, value: formData.confirmPassword, onChangeText: (text) => setFormData(prev => ({ ...prev, confirmPassword: text })), secureTextEntry: !showConfirmPassword, autoCapitalize: "none", autoCorrect: false, testID: "confirm-password-input" }), _jsx(Pressable, { style: styles.eyeButton, onPress: () => setShowConfirmPassword(!showConfirmPassword), testID: "toggle-confirm-password-visibility", children: showConfirmPassword ? (_jsx(EyeOff, { size: 20, color: Colors.textSecondary })) : (_jsx(Eye, { size: 20, color: Colors.textSecondary })) })] })), !isLogin && (_jsxs(View, { style: styles.roleContainer, children: [_jsx(Text, { style: styles.roleLabel, children: "Account Type" }), _jsxs(View, { style: styles.roleButtons, children: [_jsx(Pressable, { style: [
                                                    styles.roleButton,
                                                    formData.role === 'user' && styles.roleButtonActive
                                                ], onPress: () => setFormData(prev => ({ ...prev, role: 'user' })), testID: "user-role-button", children: _jsx(Text, { style: [
                                                        styles.roleButtonText,
                                                        formData.role === 'user' && styles.roleButtonTextActive
                                                    ], children: "Regular User" }) }), _jsx(Pressable, { style: [
                                                    styles.roleButton,
                                                    formData.role === 'parent' && styles.roleButtonActive
                                                ], onPress: () => setFormData(prev => ({ ...prev, role: 'parent' })), testID: "parent-role-button", children: _jsx(Text, { style: [
                                                        styles.roleButtonText,
                                                        formData.role === 'parent' && styles.roleButtonTextActive
                                                    ], children: "Parent/Guardian" }) })] })] })), error && (_jsx(View, { style: styles.errorContainer, children: _jsx(Text, { style: styles.errorText, children: error }) })), _jsx(Pressable, { style: [styles.submitButton, isLoading && styles.submitButtonDisabled], onPress: handleSubmit, disabled: isLoading, testID: "submit-button", children: isLoading ? (_jsx(ActivityIndicator, { color: "white", size: "small" })) : (_jsx(Text, { style: styles.submitButtonText, children: isLogin ? 'Sign In' : 'Create Account' })) }), isLogin && (_jsx(Pressable, { style: styles.forgotPasswordButton, onPress: () => {
                                    // TODO: Implement forgot password
                                    Alert.alert('Forgot Password', 'This feature will be available soon.');
                                }, testID: "forgot-password-button", children: _jsx(Text, { style: styles.forgotPasswordText, children: "Forgot Password?" }) }))] }), _jsxs(View, { style: styles.footer, children: [_jsx(Text, { style: styles.footerText, children: isLogin ? "Don't have an account? " : "Already have an account? " }), _jsx(Pressable, { onPress: toggleMode, testID: "toggle-mode-button", children: _jsx(Text, { style: styles.footerLink, children: isLogin ? 'Sign Up' : 'Sign In' }) })] })] }) }) }));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    form: {
        marginBottom: 32,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
        paddingVertical: 16,
    },
    passwordInput: {
        paddingRight: 40,
    },
    eyeButton: {
        position: 'absolute',
        right: 16,
        padding: 4,
    },
    roleContainer: {
        marginBottom: 16,
    },
    roleLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 12,
    },
    roleButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.surface,
        alignItems: 'center',
    },
    roleButtonActive: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '10',
    },
    roleButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    roleButtonTextActive: {
        color: Colors.primary,
    },
    errorContainer: {
        backgroundColor: Colors.error + '10',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: Colors.error,
        fontSize: 14,
        textAlign: 'center',
    },
    submitButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    forgotPasswordButton: {
        alignItems: 'center',
    },
    forgotPasswordText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    footerLink: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
});
