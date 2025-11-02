import React, { useEffect, useState, useCallback } from "react";
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
    Image,
    KeyboardAvoidingView,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import Modal from "react-native-modal";
import DropDownPicker from "react-native-dropdown-picker";

const YOUR_COMPUTER_IP = "192.168.110.163";
const PORT = 9999;
const API_URL =
    Platform.OS === "android"
        ? `http://10.0.2.2:${PORT}`
        : `http://${YOUR_COMPUTER_IP}:${PORT}`;

const ManageAlbumsScreen = () => {
    const [albums, setAlbums] = useState([]);
    const [filteredAlbums, setFilteredAlbums] = useState([]);
    const [search, setSearch] = useState("");
    const [artists, setArtists] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal form states
    const [modalVisible, setModalVisible] = useState(false);
    const [editingAlbum, setEditingAlbum] = useState(null);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        name: "",
        artistID: "",
        genreID: "",
        format: "CD",
        price: "",
        stock: "",
        description: "",
        spotify: "",
        youtube: "",
        image: "",
    });

    // DropDownPicker states
    const [artistOpen, setArtistOpen] = useState(false);
    const [artistValue, setArtistValue] = useState(null);
    const [artistItems, setArtistItems] = useState([]);

    const [genreOpen, setGenreOpen] = useState(false);
    const [genreValue, setGenreValue] = useState(null);
    const [genreItems, setGenreItems] = useState([]);

    const [formatOpen, setFormatOpen] = useState(false);
    const [formatValue, setFormatValue] = useState("CD");
    const formatItems = [
        { label: "CD", value: "CD" },
        { label: "Vinyl", value: "Vinyl" },
    ];

    const fetchAlbums = async () => {
        try {
            setLoading(true);
            const [albumsRes, artistsRes, genresRes] = await Promise.all([
                axios.get(`${API_URL}/api/albums`),
                axios.get(`${API_URL}/api/artists`),
                axios.get(`${API_URL}/api/genres`),
            ]);
            setAlbums(albumsRes.data);
            setFilteredAlbums(albumsRes.data);

            setArtists(artistsRes.data);
            setArtistItems(
                artistsRes.data.map((a) => ({ label: a.name, value: a._id }))
            );

            setGenres(genresRes.data);
            setGenreItems(
                genresRes.data.map((g) => ({ label: g.name, value: g._id }))
            );
        } catch (err) {
            console.error("Error fetching data:", err.message);
            Alert.alert("Error", "Cannot load albums/artists/genres.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlbums();
    }, []);

    useEffect(() => {
        if (!search.trim()) setFilteredAlbums(albums);
        else {
            const keyword = search.toLowerCase();
            setFilteredAlbums(
                albums.filter((a) => a.name.toLowerCase().includes(keyword))
            );
        }
    }, [search, albums]);

    const handleChange = (key, value) => {
        setForm({ ...form, [key]: value });
        setErrors({ ...errors, [key]: "" });
    };

    const validateForm = () => {
        let newErrors = {};
        if (!form.name.trim()) newErrors.name = "Album name is required.";
        if (!artistValue) newErrors.artistID = "Please select an artist.";
        if (!genreValue) newErrors.genreID = "Please select a genre.";
        if (!form.price) newErrors.price = "Price is required.";
        else if (isNaN(form.price)) newErrors.price = "Price must be a number.";
        else if (Number(form.price) <= 0)
            newErrors.price = "Price must be greater than 0.";
        if (!form.stock) newErrors.stock = "Stock is required.";
        else if (isNaN(form.stock)) newErrors.stock = "Stock must be a number.";
        else if (Number(form.stock) < 0)
            newErrors.stock = "Stock cannot be negative.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        const payload = {
            ...form,
            artistID: artistValue,
            genreID: genreValue,
            format: formatValue,
            price: Number(form.price),
            stock: Number(form.stock),
        };

        try {
            if (editingAlbum) {
                await axios.put(`${API_URL}/api/albums/${editingAlbum._id}`, payload);
                Alert.alert("Updated!", "Album updated successfully.");
            } else {
                await axios.post(`${API_URL}/api/albums`, payload);
                Alert.alert("Added!", "Album created successfully.");
            }
            setModalVisible(false);
            setEditingAlbum(null);
            resetForm();
            fetchAlbums();
        } catch (err) {
            console.error("Error saving album:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to save album.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/api/albums/${id}`);
            setAlbums((prev) => prev.filter((a) => a._id !== id));
            setFilteredAlbums((prev) => prev.filter((a) => a._id !== id));
            fetchAlbums();
        } catch (err) {
            console.error("Delete error:", err.message);
            Alert.alert("Error", "Failed to delete album.");
        }
    };

    const resetForm = () => {
        setForm({
            name: "",
            artistID: "",
            genreID: "",
            format: "CD",
            price: "",
            stock: "",
            description: "",
            spotify: "",
            youtube: "",
            image: "",
        });
        setArtistValue(null);
        setGenreValue(null);
        setFormatValue("CD");
    };

    const openEdit = (album) => {
        setEditingAlbum(album);
        setForm({
            name: album.name,
            price: album.price?.toString() || "",
            stock: album.stock?.toString() || "",
            description: album.description || "",
            spotify: album.spotify || "",
            youtube: album.youtube || "",
            image: album.image || "",
        });
        setArtistValue(album.artistID?._id || null);
        setGenreValue(album.genreID?._id || null);
        setFormatValue(album.format || "CD");
        setErrors({});
        setModalVisible(true);
    };

    const openCreate = () => {
        setEditingAlbum(null);
        resetForm();
        setErrors({});
        setModalVisible(true);
    };

    // handle closing other dropdowns
    const onArtistOpen = useCallback(() => {
        setGenreOpen(false);
        setFormatOpen(false);
    }, []);
    const onGenreOpen = useCallback(() => {
        setArtistOpen(false);
        setFormatOpen(false);
    }, []);
    const onFormatOpen = useCallback(() => {
        setArtistOpen(false);
        setGenreOpen(false);
    }, []);

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Manage Albums</Text>
                <TextInput
                    placeholder="Search albums..."
                    value={search}
                    onChangeText={setSearch}
                    style={styles.searchBar}
                />

                {loading ? (
                    <ActivityIndicator size="large" color="#333" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={filteredAlbums}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        renderItem={({ item }) => (
                            <View style={styles.albumCard}>
                                <Image
                                    source={{ uri: item.image || "https://via.placeholder.com/100" }}
                                    style={styles.albumImage}
                                />
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={styles.albumName}>{item.name}</Text>
                                    <Text style={styles.albumMeta}>
                                        {item.artistID?.name || "Unknown"} • {item.genreID?.name || "Unknown"}
                                    </Text>
                                    <Text style={styles.albumPrice}>
                                        {item.format} • {item.price?.toLocaleString()}₫
                                    </Text>
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

                <Modal
    isVisible={modalVisible}
    onBackdropPress={() => setModalVisible(false)}
    avoidKeyboard={true}
>
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 0 }}
    >
        <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
                {editingAlbum ? "Edit Album" : "Add Album"}
            </Text>

            <FlatList
                data={[]}
                ListHeaderComponent={
                    <>
                        <Text style={styles.label}>Album Name</Text>
                        <TextInput
                            value={form.name}
                            onChangeText={(v) => handleChange("name", v)}
                            style={styles.input}
                        />
                        {errors.name && <Text style={styles.error}>{errors.name}</Text>}

                        <Text style={styles.label}>Artist • Genre • Format</Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                            <View style={{ flex: 1, marginRight: 5 }}>
                                <DropDownPicker
                                    open={artistOpen}
                                    value={artistValue}
                                    items={artistItems}
                                    setOpen={setArtistOpen}
                                    setValue={setArtistValue}
                                    setItems={setArtistItems}
                                    zIndex={3000}
                                    zIndexInverse={1000}
                                    placeholder="Artist"
                                    onOpen={onArtistOpen}
                                />
                                {errors.artistID && <Text style={styles.error}>{errors.artistID}</Text>}
                            </View>

                            <View style={{ flex: 1, marginHorizontal: 5 }}>
                                <DropDownPicker
                                    open={genreOpen}
                                    value={genreValue}
                                    items={genreItems}
                                    setOpen={setGenreOpen}
                                    setValue={setGenreValue}
                                    setItems={setGenreItems}
                                    zIndex={2000}
                                    zIndexInverse={2000}
                                    placeholder="Genre"
                                    onOpen={onGenreOpen}
                                />
                                {errors.genreID && <Text style={styles.error}>{errors.genreID}</Text>}
                            </View>

                            <View style={{ flex: 1, marginLeft: 5 }}>
                                <DropDownPicker
                                    open={formatOpen}
                                    value={formatValue}
                                    items={formatItems}
                                    setOpen={setFormatOpen}
                                    setValue={setFormatValue}
                                    zIndex={1000}
                                    zIndexInverse={3000}
                                    placeholder="Format"
                                    onOpen={onFormatOpen}
                                />
                            </View>
                        </View>

                        <Text style={styles.label}>Price</Text>
                        <TextInput
                            keyboardType="numeric"
                            value={form.price}
                            onChangeText={(v) => handleChange("price", v)}
                            style={styles.input}
                        />
                        {errors.price && <Text style={styles.error}>{errors.price}</Text>}

                        <Text style={styles.label}>Stock</Text>
                        <TextInput
                            keyboardType="numeric"
                            value={form.stock}
                            onChangeText={(v) => handleChange("stock", v)}
                            style={styles.input}
                        />
                        {errors.stock && <Text style={styles.error}>{errors.stock}</Text>}

                        <Text style={styles.label}>Spotify Link</Text>
                        <TextInput
                            value={form.spotify}
                            onChangeText={(v) => handleChange("spotify", v)}
                            style={styles.input}
                        />

                        <Text style={styles.label}>YouTube Link</Text>
                        <TextInput
                            value={form.youtube}
                            onChangeText={(v) => handleChange("youtube", v)}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            multiline
                            value={form.description}
                            onChangeText={(v) => handleChange("description", v)}
                            style={[styles.input, { height: 80 }]}
                        />

                        <Text style={styles.label}>Image URL</Text>
                        <TextInput
                            value={form.image}
                            onChangeText={(v) => handleChange("image", v)}
                            style={styles.input}
                        />
                        {form.image ? (
                            <Image source={{ uri: form.image }} style={styles.previewImage} />
                        ) : (
                            <Text style={{ textAlign: "center", color: "#666", marginBottom: 10 }}>
                                No image preview
                            </Text>
                        )}

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
                    </>
                }
            />
        </View>
    </KeyboardAvoidingView>
</Modal>

            </View>
        </SafeAreaView>
    );
};

export default ManageAlbumsScreen;

const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: "#fff" },
    container: { flex: 1, padding: 16 },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#000",
        marginBottom: 10,
        textAlign: "center",
    },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 4, color: "#222" },
    error: { color: "red", fontSize: 12, marginTop: -6, marginBottom: 8 },
    searchBar: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 8,
        marginBottom: 10,
    },
    albumCard: {
        flexDirection: "row",
        backgroundColor: "#f7f7f7",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: "center",
    },
    albumImage: { width: 60, height: 60, borderRadius: 8 },
    albumName: { fontSize: 16, fontWeight: "600", color: "#000" },
    albumMeta: { color: "#555", fontSize: 13, marginTop: 2 },
    albumPrice: { color: "#007AFF", marginTop: 4, fontWeight: "500" },
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
    maxHeight: "90%", // shrink to content, no extra white space
},
    modalTitle: { fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 10 },
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 },
    previewImage: { width: "100%", height: 160, borderRadius: 10, marginBottom: 10 },
    modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    modalBtn: { flex: 1, marginHorizontal: 5, padding: 12, borderRadius: 8, alignItems: "center" },
    modalBtnText: { color: "#fff", fontWeight: "600" },
});
