import React, { useEffect, useState, useCallback } from 'react';
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
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';

const YOUR_COMPUTER_IP = '192.168.110.163';
const PORT = 9999;
const API_URL =
  Platform.OS === 'android'
    ? `http://10.0.2.2:${PORT}`
    : `http://${YOUR_COMPUTER_IP}:${PORT}`;

const ManageArtistsScreen = () => {
  const [artists, setArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});

  // Fetch artists
  const fetchArtists = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/artists`);
      setArtists(res.data);
      setFilteredArtists(res.data);
    } catch (err) {
      console.error('Fetch artists error:', err.message);
      Alert.alert('Error', 'Cannot load artists.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  // Search filter
  useEffect(() => {
    if (!search.trim()) setFilteredArtists(artists);
    else {
      const keyword = search.toLowerCase();
      setFilteredArtists(
        artists.filter((a) => a.name.toLowerCase().includes(keyword))
      );
    }
  }, [search, artists]);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
    setErrors({ ...errors, [key]: '' });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Artist name is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingArtist) {
        await axios.put(`${API_URL}/api/artists/${editingArtist._id}`, form);
        Alert.alert('Updated', 'Artist updated successfully.');
      } else {
        await axios.post(`${API_URL}/api/artists`, form);
        Alert.alert('Added', 'Artist created successfully.');
      }
      setModalVisible(false);
      setEditingArtist(null);
      setForm({ name: '', description: '' });
      fetchArtists();
    } catch (err) {
      console.error('Save artist error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to save artist.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/artists/${id}`);
      setArtists((prev) => prev.filter((a) => a._id !== id));
      setFilteredArtists((prev) => prev.filter((a) => a._id !== id));
      fetchArtists();
    } catch (err) {
      console.error('Delete artist error:', err.message);
      Alert.alert('Error', 'Failed to delete artist.');
    }
  };

  const openEdit = (artist) => {
    setEditingArtist(artist);
    setForm({ name: artist.name, description: artist.description || '' });
    setErrors({});
    setModalVisible(true);
  };

  const openCreate = () => {
    setEditingArtist(null);
    setForm({ name: '', description: '' });
    setErrors({});
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Manage Artists</Text>

        <TextInput
          placeholder="Search artists..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchBar}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#333" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={filteredArtists}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.artistCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.artistName}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.artistDesc}>{item.description}</Text>
                  ) : null}
                </View>
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
          avoidKeyboard
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 0 }}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingArtist ? 'Edit Artist' : 'Add Artist'}
              </Text>

              <Text style={styles.label}>Name</Text>
              <TextInput
                value={form.name}
                onChangeText={(v) => handleChange('name', v)}
                style={styles.input}
              />
              {errors.name && <Text style={styles.error}>{errors.name}</Text>}

              <Text style={styles.label}>Description</Text>
              <TextInput
                multiline
                value={form.description}
                onChangeText={(v) => handleChange('description', v)}
                style={[styles.input, { height: 80 }]}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: '#222' }]}
                  onPress={handleSave}
                >
                  <Text style={styles.modalBtnText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: '#999' }]}
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

export default ManageArtistsScreen;

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
  },
  artistCard: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  artistName: { fontSize: 16, fontWeight: '600', color: '#000' },
  artistDesc: { color: '#555', fontSize: 13, marginTop: 2 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', width: 55, marginLeft: 8 },
  addButton: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: '#000',
    width: 56,
    height: 56,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 5,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '90%',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#222' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  error: { color: 'red', fontSize: 12, marginTop: -6, marginBottom: 8 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalBtn: { flex: 1, marginHorizontal: 5, padding: 12, borderRadius: 8, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontWeight: '600' },
});
