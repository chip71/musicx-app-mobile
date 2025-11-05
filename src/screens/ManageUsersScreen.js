import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    KeyboardAvoidingView,
} from "react-native";
import axios from "axios";
import { Ionicons, Feather } from "@expo/vector-icons";
import Modal from "react-native-modal";
// 🔗 Use deployed Render backend
const API_URL = "https://musicx-mobile-backend.onrender.com";
console.log("🔗 Using API:", API_URL);


const roles = ["customer", "admin"];

const ManageUsersScreen = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        newPassword: "",
        role: "customer",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/admin/users`);
            setUsers(res.data);
            setFilteredUsers(res.data);
        } catch (err) {
            console.error("Error fetching users:", err.message);
            Alert.alert("Error", "Cannot load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const keyword = search.toLowerCase().trim();
        if (!keyword) {
            setFilteredUsers(users);
            return;
        }
        setFilteredUsers(
            users.filter(
                (u) =>
                    u.name.toLowerCase().includes(keyword) ||
                    u.email.toLowerCase().includes(keyword)
            )
        );
    }, [search, users]);

    const handleChange = (key, value) => {
        setForm({ ...form, [key]: value });
        // Do not clear errors on input — errors show only on Save
    };

    const validateForm = () => {
        let newErrors = {};

        // Name validation
        let value = form.name;
        let error = "";
        if (!value.trim()) error = "Full name is required.";
        else if (value.length < 3) error = "Name must be at least 3 characters.";
        if (error) newErrors.name = error;

        // Email validation
        value = form.email;
        error = "";
        if (!editingUser) { // only validate email when creating user
            if (!value.trim()) error = "Email is required.";
            else if (!/\S+@\S+\.\S+/.test(value)) error = "Enter a valid email address.";
            if (error) newErrors.email = error;
        }

        // Password validation
        if (!editingUser || (editingUser && form.newPassword)) {
            value = editingUser ? form.newPassword : form.password;
            error = "";
            if (!value.trim()) error = "Password is required.";
            else if (value.length < 8) error = "Password must be at least 8 characters.";
            else if (!/[A-Z]/.test(value)) error = "Password must include an uppercase letter.";
            else if (!/[a-z]/.test(value)) error = "Password must include a lowercase letter.";
            else if (!/[0-9]/.test(value)) error = "Password must include a number.";
            else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(value))
                error = "Password must include a special character.";
            if (error) editingUser ? (newErrors.newPassword = error) : (newErrors.password = error);
        }

        // Role validation
        if (!form.role.trim()) newErrors.role = "Role is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSave = async () => {
        if (!validateForm()) return; // validation messages now appear on Save

        try {
            const payload = {
                name: form.name.trim(),
                role: form.role,
            };
            if (!editingUser && form.password) payload.password = form.password;
            if (editingUser && form.newPassword) payload.password = form.newPassword;

            if (editingUser) {
                await axios.put(`${API_URL}/api/admin/users/${editingUser._id}`, payload);
                Alert.alert("Updated!", "User updated successfully.");
            } else {
                payload.email = form.email.trim();
                await axios.post(`${API_URL}/api/admin/users`, payload);
                Alert.alert("Added!", "User created successfully.");
            }

            setModalVisible(false);
            setEditingUser(null);
            resetForm();
            fetchUsers();
        } catch (err) {
            console.error("Error saving user:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to save user.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/api/admin/users/${id}`);
            setUsers((prev) => prev.filter((u) => u._id !== id));
            setFilteredUsers((prev) => prev.filter((u) => u._id !== id));
        } catch (err) {
            console.error("Delete error:", err.message);
            Alert.alert("Error", "Failed to delete user.");
        }
    };

    const resetForm = () => {
        setForm({
            name: "",
            email: "",
            password: "",
            newPassword: "",
            role: "customer",
        });
        setErrors({});
        setShowPassword(false);
        setShowNewPassword(false);
    };

    const openEdit = (user) => {
        setEditingUser(user);
        setForm({
            name: user.name || "",
            email: user.email || "",
            password: "",
            newPassword: "",
            role: user.role || "customer",
        });
        setErrors({});
        setShowNewPassword(false);
        setModalVisible(true);
    };

    const openCreate = () => {
        setEditingUser(null);
        resetForm();
        setModalVisible(true);
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Manage Users</Text>

                <TextInput
                    placeholder="Search users..."
                    value={search}
                    onChangeText={setSearch}
                    style={styles.searchBar}
                />

                {loading ? (
                    <ActivityIndicator size="large" color="#333" style={{ marginTop: 50 }} />
                ) : (
                    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                        {filteredUsers.map((u) => (
                            <View key={u._id} style={styles.userCard}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.userName}>{u.name}</Text>
                                    <Text style={styles.userEmail}>{u.email}</Text>
                                    <Text style={styles.userRole}>Role: {u.role}</Text>
                                </View>
                                <View style={styles.actionsRow}>
                                    <TouchableOpacity onPress={() => openEdit(u)}>
                                        <Ionicons name="create-outline" size={22} color="#222" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(u._id)}>
                                        <Ionicons name="trash-outline" size={22} color="red" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}

                <TouchableOpacity style={styles.addButton} onPress={openCreate}>
                    <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>

                <Modal
                    isVisible={modalVisible}
                    onBackdropPress={() => setModalVisible(false)}
                    avoidKeyboard
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1 }}
                    >
                        <View style={styles.modalContent}>
                            <ScrollView keyboardShouldPersistTaps="handled">
                                <Text style={styles.modalTitle}>
                                    {editingUser ? "Edit User" : "Add User"}
                                </Text>

                                <Text style={styles.label}>Name</Text>
                                <TextInput
                                    value={form.name}
                                    onChangeText={(v) => handleChange("name", v)}
                                    style={styles.input}
                                />
                                {errors.name && <Text style={styles.error}>{errors.name}</Text>}

                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    value={form.email}
                                    style={[styles.input, editingUser && { backgroundColor: "#eee" }]}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!editingUser}
                                    onChangeText={(v) => handleChange("email", v)}
                                />
                                {errors.email && <Text style={styles.error}>{errors.email}</Text>}

                                {!editingUser && (
                                    <>
                                        <Text style={styles.label}>Password</Text>
                                        <View style={styles.passwordWrapper}>
                                            <TextInput
                                                value={form.password}
                                                onChangeText={(v) => handleChange("password", v)}
                                                style={styles.input}
                                                secureTextEntry={!showPassword}
                                            />
                                            <TouchableOpacity
                                                style={styles.eyeIcon}
                                                onPress={() => setShowPassword(!showPassword)}
                                            >
                                                <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#555" />
                                            </TouchableOpacity>
                                        </View>
                                        {errors.password && <Text style={styles.error}>{errors.password}</Text>}
                                    </>
                                )}

                                {editingUser && (
                                    <>
                                        <Text style={styles.label}>New Password (optional)</Text>
                                        <View style={styles.passwordWrapper}>
                                            <TextInput
                                                value={form.newPassword}
                                                onChangeText={(v) => handleChange("newPassword", v)}
                                                style={styles.input}
                                                secureTextEntry={!showNewPassword}
                                            />
                                            <TouchableOpacity
                                                style={styles.eyeIcon}
                                                onPress={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                <Feather name={showNewPassword ? "eye" : "eye-off"} size={20} color="#555" />
                                            </TouchableOpacity>
                                        </View>
                                        {errors.newPassword && <Text style={styles.error}>{errors.newPassword}</Text>}
                                    </>
                                )}

                                <Text style={styles.label}>Role</Text>
                                {roles.map((r) => (
                                    <TouchableOpacity
                                        key={r}
                                        style={[
                                            styles.roleOption,
                                            form.role === r && styles.roleSelected,
                                        ]}
                                        onPress={() => handleChange("role", r)}
                                    >
                                        <Text style={{ color: form.role === r ? "#fff" : "#222" }}>{r}</Text>
                                    </TouchableOpacity>
                                ))}
                                {errors.role && <Text style={styles.error}>{errors.role}</Text>}

                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={[
                                            styles.modalBtn,
                                            { backgroundColor: "#222" },
                                        ]}
                                        onPress={handleSave}
                                    >
                                        <Text style={styles.modalBtnText}>Save</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalBtn, { backgroundColor: "#999" }]}
                                        onPress={() => {
                                            setModalVisible(false);
                                            resetForm();
                                            setEditingUser(null);
                                        }}
                                    >
                                        <Text style={styles.modalBtnText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

export default ManageUsersScreen;

const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: "#fff" },
    container: { flex: 1, padding: 16 },
    title: { fontSize: 22, fontWeight: "700", color: "#000", marginBottom: 10, textAlign: "center" },
    searchBar: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 8, marginBottom: 10 },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 4, color: "#222" },
    error: { color: "red", fontSize: 12, marginTop: -6, marginBottom: 8 },
    userCard: {
        flexDirection: "row",
        backgroundColor: "#f7f7f7",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: "center",
    },
    userName: { fontSize: 16, fontWeight: "600", color: "#000" },
    userEmail: { color: "#555", fontSize: 13, marginTop: 2 },
    userRole: { color: "#007AFF", marginTop: 4, fontWeight: "500" },
    actionsRow: { flexDirection: "row", justifyContent: "space-between", width: 55, marginLeft: 8 },
    addButton: {
        position: "absolute",
        bottom: 25,
        right: 25,
        backgroundColor: "#000",
        width: 56,
        height: 56,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        maxHeight: "85%",
        marginTop: 100,
    },
    modalTitle: { fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 10 },
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 },
    modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    modalBtn: { flex: 1, marginHorizontal: 5, padding: 12, borderRadius: 8, alignItems: "center" },
    modalBtnText: { color: "#fff", fontWeight: "600" },
    roleOption: { padding: 10, borderRadius: 8, marginVertical: 4, borderWidth: 1, borderColor: "#ccc" },
    roleSelected: { backgroundColor: "#222", borderColor: "#222" },
    passwordWrapper: { position: "relative", justifyContent: "center" },
    eyeIcon: { position: "absolute", right: 12, top: 12 },
});
