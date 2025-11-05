import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Easing,
  SafeAreaView,
  Platform,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AlbumCard from "../components/AlbumCard";
import Navbar from "../components/Navbar";

const API_URL = "https://musicx-mobile-backend.onrender.com";
console.log("🔗 Using API:", API_URL);


const Api = {
  fetchAlbums: async () => (await axios.get(`${API_URL}/api/albums`)).data,
  fetchArtists: async () => (await axios.get(`${API_URL}/api/artists`)).data,
  fetchGenres: async () => (await axios.get(`${API_URL}/api/genres`)).data,
};

const AlbumScreen = () => {
  const navigation = useNavigation();

  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [sortOption, setSortOption] = useState("name");

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [albumData, artistData, genreData] = await Promise.all([
          Api.fetchAlbums(),
          Api.fetchArtists(),
          Api.fetchGenres(),
        ]);
        setAlbums(albumData || []);
        setFilteredAlbums(albumData || []);
        setArtists(artistData || []);
        setGenres(genreData || []);
      } catch (err) {
        console.error("Error fetching albums:", err);
        setError("Failed to load albums. Is the server running?");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = albums;

    if (searchText.trim()) {
      const text = searchText.toLowerCase();
      result = result.filter((a) => a.name.toLowerCase().includes(text));
    }

    if (selectedArtists.length > 0) {
      result = result.filter((a) =>
        selectedArtists.includes(a.artistID?._id || a.artistID)
      );
    }

    if (selectedGenres.length > 0) {
      result = result.filter((a) =>
        selectedGenres.includes(a.genreID?._id || a.genreID)
      );
    }

    result = result.filter(
      (a) => a.price >= priceRange[0] && a.price <= priceRange[1]
    );

    if (sortOption === "name") {
      result = result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "nameDesc") {
      result = result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOption === "priceAsc") {
      result = result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "priceDesc") {
      result = result.sort((a, b) => b.price - a.price);
    }

    setFilteredAlbums([...result]);
  }, [
    searchText,
    selectedArtists,
    selectedGenres,
    albums,
    priceRange,
    sortOption,
  ]);

  const toggleSelection = (id, selectedArray, setSelectedArray) => {
    if (selectedArray.includes(id)) {
      setSelectedArray(selectedArray.filter((x) => x !== id));
    } else {
      setSelectedArray([...selectedArray, id]);
    }
  };

  const toggleFilter = () => {
    const newState = !isFilterVisible;
    setIsFilterVisible(newState);
    Animated.timing(slideAnim, {
      toValue: newState ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading albums...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const panelHeight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 250],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Navbar
        searchText={searchText}
        setSearchText={setSearchText}
        showSearch={true}
      />

      {/* Filter Toggle */}
      <TouchableOpacity style={styles.filterToggle} onPress={toggleFilter}>
        <Ionicons name="options" size={20} color="#000" />
        <Text style={styles.filterToggleText}>Filters</Text>
      </TouchableOpacity>

      {/* Filter Panel */}
      <Animated.View style={[styles.filterPanel, { height: panelHeight }]}>
        <View style={styles.filterContent}>
          <Text style={styles.filterLabel}>Sort By</Text>
          <View style={styles.filterRow}>
            {[
              { label: "A–Z", value: "name" },
              { label: "Z–A", value: "nameDesc" },
              { label: "Low–High", value: "priceAsc" },
              { label: "High–Low", value: "priceDesc" },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.filterButton,
                  sortOption === opt.value && styles.filterButtonActive,
                ]}
                onPress={() => setSortOption(opt.value)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    sortOption === opt.value && styles.filterButtonTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Artist */}
          <Text style={styles.filterLabel}>Artist</Text>
          <FlatList
            horizontal
            data={[{ _id: "all", name: "All" }, ...artists]}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  (item._id === "all" && selectedArtists.length === 0) ||
                  selectedArtists.includes(item._id)
                    ? styles.filterButtonActive
                    : null,
                ]}
                onPress={() =>
                  item._id === "all"
                    ? setSelectedArtists([])
                    : toggleSelection(item._id, selectedArtists, setSelectedArtists)
                }
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    (item._id === "all" && selectedArtists.length === 0) ||
                    selectedArtists.includes(item._id)
                      ? styles.filterButtonTextActive
                      : null,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />

          {/* Genre */}
          <Text style={styles.filterLabel}>Genre</Text>
          <FlatList
            horizontal
            data={[{ _id: "all", name: "All" }, ...genres]}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  (item._id === "all" && selectedGenres.length === 0) ||
                  selectedGenres.includes(item._id)
                    ? styles.filterButtonActive
                    : null,
                ]}
                onPress={() =>
                  item._id === "all"
                    ? setSelectedGenres([])
                    : toggleSelection(item._id, selectedGenres, setSelectedGenres)
                }
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    (item._id === "all" && selectedGenres.length === 0) ||
                    selectedGenres.includes(item._id)
                      ? styles.filterButtonTextActive
                      : null,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </Animated.View>

      {/* Albums */}
      <FlatList
        data={filteredAlbums}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.getParent()?.navigate("Explore", {
                screen: "AlbumDetail",
                params: { albumId: item._id },
              })
            }
          >
            <AlbumCard
              album={item}
              artist={artists.find((a) => a._id === item.artistID)}
              genre={genres.find((g) => g._id === item.genreID)}
            />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  loadingText: { color: "#000", marginTop: 10 },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 20,
  },

  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  filterToggleText: { marginLeft: 8, fontWeight: "600", fontSize: 16 },

  filterPanel: {
    overflow: "hidden",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  filterContent: { padding: 12 },
  filterLabel: { fontWeight: "700", marginTop: 10, marginBottom: 6 },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#EEE",
    marginRight: 8,
    marginBottom: 6,
  },
  filterButtonActive: { backgroundColor: "#000" },
  filterButtonText: { color: "#000" },
  filterButtonTextActive: { color: "#FFF" },
  filterRow: { flexDirection: "row", flexWrap: "wrap" },
  listContent: { paddingHorizontal: 12, paddingVertical: 10 },
  row: { justifyContent: "space-evenly", marginBottom: 16 },
});

export default AlbumScreen;
