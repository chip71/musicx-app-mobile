import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import Modal from "react-native-modal";

const YOUR_COMPUTER_IP = "192.168.110.163";
const PORT = 9999;
const API_URL =
  Platform.OS === "android"
    ? `http://10.0.2.2:${PORT}`
    : `http://${YOUR_COMPUTER_IP}:${PORT}`;

const ManageGenresScreen = () => {
  const [genres, setGenres] = useState([]);
  const [filteredGenres, setFilteredGenres] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
  });

  const fetchGenres = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/genres`);
      setGenres(res.data);
      setFilteredGenres(res.data);
    } catch (err) {
      console.error("Error fetching genres:", err.message);
      Alert.alert("Error", "Cannot load genres.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  // Filter genres by search
  useEffect(() => {
    if (!search.trim()) setFilteredGenres(genres);
    else {
      const keyword = search.toLowerCase();
      setFilteredGenres(
        genres.filter((g) => g.name.toLowerCase().includes(keyword))
      );
    }
  }, [search, genres]);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
    setErrors({ ...errors, [key]: "" });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!form.name.trim()) newErrors.name = "Genre name is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingGenre) {
        await axios.put(`${API_URL}/api/genres/${editingGenre._id}`, form);
        Alert.alert("Updated!", "Genre updated successfully.");
      } else {
        await axios.post(`${API_URL}/api/genres`, form);
        Alert.alert("Added!", "Genre created successfully.");
      }
      setModalVisible(false);
      setEditingGenre(null);
      resetForm();
      fetchGenres();
    } catch (err) {
      console.error("Error saving genre:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to save genre.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/genres/${id}`);
      setGenres((prev) => prev.filter((g) => g._id !== id));
      setFilteredGenres((prev) => prev.filter((g) => g._id !== id));
    } catch (err) {
      console.error("Delete error:", err.message);
      Alert.alert("Error", "Failed to delete genre.");
    }
  };

  const resetForm = () => {
    setForm({ name: "" });
  };

  const openEdit = (genre) => {
    setEditingGenre(genre);
    setForm({ name: genre.name || "" });
    setErrors({});
    setModalVisible(true);
  };

  const openCreate = () => {
    setEditingGenre(null);
    resetForm();
    setErrors({});
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Manage Genres</Text>

        {/* Search bar */}
        <TextInput
          placeholder="Search genres..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchBar}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#333" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={filteredGenres}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View style={styles.genreCard}>
                <Text style={styles.genreName}>{item.name}</Text>
                <View style={styles.actionsRow}>
                  <TouchableOpacity onPress={() => openEdit(item)}>
                    <Ionicons name="create-outline" size={22} color="#222" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item._id)}>
                    <Ionicons name="trash-outline" size={22} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        <TouchableOpacity style={styles.addButton} onPress={openCreate}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Modal */}
        <Modal
          isVisible={modalVisible}
          onBackdropPress={() => setModalVisible(false)}
          avoidKeyboard={true}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingGenre ? "Edit Genre" : "Add Genre"}
              </Text>

              <Text style={styles.label}>Genre Name</Text>
              <TextInput
                value={form.name}
                onChangeText={(v) => handleChange("name", v)}
                style={styles.input}
              />
              {errors.name && <Text style={styles.error}>{errors.name}</Text>}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#222" }]}
                  onPress={handleSave}
                >
                  <Text style={styles.modalBtnText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#999" }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default ManageGenresScreen;

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "700", color: "#000", marginBottom: 10, textAlign: "center" },
  searchBar: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 8, marginBottom: 10 },
  genreCard: {
    flexDirection: "row",
    backgroundColor: "#f7f7f7",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  genreName: { fontSize: 16, fontWeight: "600", color: "#000" },
  actionsRow: { flexDirection: "row", justifyContent: "space-between", width: 55 },
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
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 5,
  },
  modalContent: { 
    backgroundColor: "#fff", 
    borderRadius: 12, 
    padding: 16,
    maxHeight: "50%",
    marginTop: 100,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 10 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 4, color: "#222" },
  error: { color: "red", fontSize: 12, marginTop: -6, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  modalBtn: { flex: 1, marginHorizontal: 5, padding: 12, borderRadius: 8, alignItems: "center" },
  modalBtnText: { color: "#fff", fontWeight: "600" },
});
