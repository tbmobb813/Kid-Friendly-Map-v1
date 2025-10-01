import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Modal, Alert } from 'react-native';
import Colors from '@/constants/colors';
import { useCategoryManagement } from '@/stores/categoryStore';
import { ArrowLeft, Plus, Edit3, Trash2, Check, X } from 'lucide-react-native';
import CategoryButton from './CategoryButton';
const CategoryManagement = ({ onBack, userMode }) => {
    const { categories, settings, getApprovedCategories, getPendingCategories, addCategory, updateCategory, deleteCategory, approveCategory, getAvailableIcons, getAvailableColors, canCreateCategory, needsApproval, } = useCategoryManagement();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('MapPin');
    const [selectedColor, setSelectedColor] = useState('#007AFF');
    const approvedCategories = getApprovedCategories();
    const pendingCategories = getPendingCategories();
    const availableIcons = getAvailableIcons();
    const availableColors = getAvailableColors();
    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            Alert.alert('Error', 'Please enter a category name');
            return;
        }
        if (!canCreateCategory(userMode)) {
            Alert.alert('Limit Reached', `You can only create up to ${settings.maxCustomCategories} custom categories.`);
            return;
        }
        try {
            const isApproved = !needsApproval(userMode);
            await addCategory({
                name: newCategoryName.trim(),
                icon: selectedIcon,
                color: selectedColor,
                isDefault: false,
                createdBy: userMode,
                isApproved,
            });
            setShowCreateModal(false);
            setNewCategoryName('');
            setSelectedIcon('MapPin');
            setSelectedColor('#007AFF');
            if (needsApproval(userMode)) {
                Alert.alert('Category Created', 'Your category has been created and is waiting for parent approval.');
            }
            else {
                Alert.alert('Success', 'Category created successfully!');
            }
        }
        catch (error) {
            Alert.alert('Error', 'Failed to create category. Please try again.');
        }
    };
    const handleEditCategory = async () => {
        if (!editingCategory || !newCategoryName.trim()) {
            Alert.alert('Error', 'Please enter a category name');
            return;
        }
        try {
            await updateCategory(editingCategory.id, {
                name: newCategoryName.trim(),
                icon: selectedIcon,
                color: selectedColor,
            });
            setEditingCategory(null);
            setNewCategoryName('');
            setSelectedIcon('MapPin');
            setSelectedColor('#007AFF');
            Alert.alert('Success', 'Category updated successfully!');
        }
        catch (error) {
            Alert.alert('Error', 'Failed to update category. Please try again.');
        }
    };
    const handleDeleteCategory = (category) => {
        if (category.isDefault) {
            Alert.alert('Cannot Delete', 'Default categories cannot be deleted.');
            return;
        }
        Alert.alert('Delete Category', `Are you sure you want to delete "${category.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteCategory(category.id);
                        Alert.alert('Success', 'Category deleted successfully!');
                    }
                    catch (error) {
                        Alert.alert('Error', 'Failed to delete category. Please try again.');
                    }
                },
            },
        ]);
    };
    const handleApproveCategory = async (categoryId) => {
        try {
            await approveCategory(categoryId);
            Alert.alert('Success', 'Category approved!');
        }
        catch (error) {
            Alert.alert('Error', 'Failed to approve category. Please try again.');
        }
    };
    const openCreateModal = () => {
        setNewCategoryName('');
        setSelectedIcon('MapPin');
        setSelectedColor('#007AFF');
        setEditingCategory(null);
        setShowCreateModal(true);
    };
    const openEditModal = (category) => {
        setNewCategoryName(category.name);
        setSelectedIcon(category.icon);
        setSelectedColor(category.color);
        setEditingCategory(category);
        setShowCreateModal(true);
    };
    const CategoryModal = () => (_jsx(Modal, { visible: showCreateModal, animationType: "slide", presentationStyle: "pageSheet", children: _jsxs(View, { style: styles.modalContainer, children: [_jsxs(View, { style: styles.modalHeader, children: [_jsx(Pressable, { onPress: () => setShowCreateModal(false), style: styles.modalButton, children: _jsx(X, { size: 24, color: Colors.text }) }), _jsx(Text, { style: styles.modalTitle, children: editingCategory ? 'Edit Category' : 'Create Category' }), _jsx(Pressable, { onPress: editingCategory ? handleEditCategory : handleCreateCategory, style: styles.modalButton, children: _jsx(Check, { size: 24, color: Colors.primary }) })] }), _jsxs(ScrollView, { style: styles.modalContent, children: [_jsxs(View, { style: styles.previewContainer, children: [_jsx(Text, { style: styles.sectionTitle, children: "Preview" }), _jsx(CategoryButton, { customCategory: {
                                        id: 'preview',
                                        name: newCategoryName || 'Category Name',
                                        icon: selectedIcon,
                                        color: selectedColor,
                                        isDefault: false,
                                        createdBy: userMode,
                                        isApproved: true,
                                        createdAt: Date.now(),
                                    }, onPress: () => { }, size: "medium" })] }), _jsxs(View, { style: styles.inputSection, children: [_jsx(Text, { style: styles.sectionTitle, children: "Category Name" }), _jsx(TextInput, { style: styles.textInput, value: newCategoryName, onChangeText: setNewCategoryName, placeholder: "Enter category name", maxLength: 20 })] }), _jsxs(View, { style: styles.inputSection, children: [_jsx(Text, { style: styles.sectionTitle, children: "Choose Icon" }), _jsx(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, style: styles.iconScroll, children: availableIcons.map((icon) => (_jsx(Pressable, { style: [
                                            styles.iconOption,
                                            selectedIcon === icon && styles.selectedIconOption,
                                        ], onPress: () => setSelectedIcon(icon), children: _jsx(CategoryButton, { customCategory: {
                                                id: 'temp',
                                                name: '',
                                                icon,
                                                color: selectedColor,
                                                isDefault: false,
                                                createdBy: userMode,
                                                isApproved: true,
                                                createdAt: Date.now(),
                                            }, onPress: () => setSelectedIcon(icon), size: "small" }) }, icon))) })] }), _jsxs(View, { style: styles.inputSection, children: [_jsx(Text, { style: styles.sectionTitle, children: "Choose Color" }), _jsx(View, { style: styles.colorGrid, children: availableColors.map((color) => (_jsx(Pressable, { style: [
                                            styles.colorOption,
                                            { backgroundColor: color },
                                            selectedColor === color && styles.selectedColorOption,
                                        ], onPress: () => setSelectedColor(color) }, color))) })] })] })] }) }));
    return (_jsxs(View, { style: styles.container, children: [_jsxs(View, { style: styles.header, children: [_jsx(Pressable, { onPress: onBack, style: styles.backButton, children: _jsx(ArrowLeft, { size: 24, color: Colors.text }) }), _jsx(Text, { style: styles.title, children: "Manage Categories" }), canCreateCategory(userMode) && (_jsx(Pressable, { onPress: openCreateModal, style: styles.addButton, children: _jsx(Plus, { size: 24, color: Colors.primary }) }))] }), _jsxs(ScrollView, { style: styles.content, children: [userMode === 'parent' && pendingCategories.length > 0 && (_jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Pending Approval" }), _jsx(Text, { style: styles.sectionDescription, children: "Categories created by your child that need approval" }), pendingCategories.map((category) => (_jsxs(View, { style: styles.categoryItem, children: [_jsx(CategoryButton, { customCategory: category, onPress: () => { }, size: "small" }), _jsxs(View, { style: styles.categoryInfo, children: [_jsx(Text, { style: styles.categoryName, children: category.name }), _jsxs(Text, { style: styles.categoryMeta, children: ["Created ", new Date(category.createdAt).toLocaleDateString()] })] }), _jsxs(View, { style: styles.categoryActions, children: [_jsx(Pressable, { onPress: () => handleApproveCategory(category.id), style: [styles.actionButton, styles.approveButton], children: _jsx(Check, { size: 20, color: "#FFF" }) }), _jsx(Pressable, { onPress: () => handleDeleteCategory(category), style: [styles.actionButton, styles.deleteButton], children: _jsx(X, { size: 20, color: "#FFF" }) })] })] }, category.id)))] })), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "All Categories" }), _jsx(Text, { style: styles.sectionDescription, children: userMode === 'parent'
                                    ? 'Manage all categories available to your child'
                                    : 'Your available categories' }), approvedCategories.map((category) => (_jsxs(View, { style: styles.categoryItem, children: [_jsx(CategoryButton, { customCategory: category, onPress: () => { }, size: "small" }), _jsxs(View, { style: styles.categoryInfo, children: [_jsx(Text, { style: styles.categoryName, children: category.name }), _jsx(Text, { style: styles.categoryMeta, children: category.isDefault ? 'Default' : `Created by ${category.createdBy}` })] }), !category.isDefault && (userMode === 'parent' || category.createdBy === userMode) && (_jsxs(View, { style: styles.categoryActions, children: [_jsx(Pressable, { onPress: () => openEditModal(category), style: [styles.actionButton, styles.editButton], children: _jsx(Edit3, { size: 20, color: "#FFF" }) }), _jsx(Pressable, { onPress: () => handleDeleteCategory(category), style: [styles.actionButton, styles.deleteButton], children: _jsx(Trash2, { size: 20, color: "#FFF" }) })] }))] }, category.id)))] })] }), _jsx(CategoryModal, {})] }));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    addButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 16,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    categoryInfo: {
        flex: 1,
        marginLeft: 16,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    categoryMeta: {
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 2,
    },
    categoryActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: Colors.primary,
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    approveButton: {
        backgroundColor: '#34C759',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalButton: {
        padding: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    previewContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    inputSection: {
        marginBottom: 24,
    },
    textInput: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: Colors.text,
        backgroundColor: Colors.card,
    },
    iconScroll: {
        marginTop: 8,
    },
    iconOption: {
        marginRight: 8,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedIconOption: {
        borderColor: Colors.primary,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 8,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: 'transparent',
    },
    selectedColorOption: {
        borderColor: Colors.text,
    },
});
export default CategoryManagement;
