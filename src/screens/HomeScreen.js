import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import axios from 'axios';
import AlbumRow from '../components/AlbumRow';
import Navbar from '../components/Navbar';

// --- API URL SETUP ---
let API_URL =
  Platform.OS === 'web' ? 'http://localhost:9999' : 'http://192.168.137.1:9999';
// --- END OF API URL SETUP ---

const Api = {
  fetchAlbums: async () => (await axios.get(`${API_URL}/api/albums`)).data,
  fetchArtists: async () => (await axios.get(`${API_URL}/api/artists`)).data,
  fetchGenres: async () => (await axios.get(`${API_URL}/api/genres`)).data,
};

// ✅ Accept navigation prop
const HomeScreen = ({ navigation }) => {
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [albumResponse, artistResponse, genreResponse] = await Promise.all([
          Api.fetchAlbums(),
          Api.fetchArtists(),
          Api.fetchGenres(),
        ]);
        setAlbums(albumResponse);
        setArtists(artistResponse);
        setGenres(genreResponse);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Is the server running?');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper functions
  const getArtist = (artistID) =>
    artists.find((a) => a._id === artistID) || { name: 'Unknown Artist' };
  
  const getGenre = (genreID) =>
    genres.find((g) => g._id === genreID) || { name: 'Unknown Genre' };

  // --- NAVIGATION HANDLER (Copied from previous step) ---
  const handleArtistPress = (artistID) => {
    navigation.navigate('ArtistDetail', { artistId: artistID });
  };
  // --------------------------

  // --- FILTER LOGIC (for search results page) ---
  const getFilteredAlbums = () => {
    let results = albums;
    const searchLower = searchText.toLowerCase().trim();

    if (searchLower.length > 0) {
      results = results.filter((a) => {
        const artist = getArtist(a.artistID);
        const artistName = artist ? artist.name.toLowerCase() : '';
        const genre = getGenre(a.genreID);
        const genreName = genre ? genre.name.toLowerCase() : '';

        return (
          a.name.toLowerCase().includes(searchLower) ||
          artistName.includes(searchLower) ||
          genreName.includes(searchLower)
        );
      });
    }

    if (selectedFormat !== 'All') {
      results = results.filter((a) => a.format === selectedFormat);
    }

    return results;
  };

  const filteredAlbums = getFilteredAlbums();
  
  const matchingArtists = artists.filter(
    (a) =>
      a.name.toLowerCase().includes(searchText.toLowerCase()) &&
      searchText.trim().length > 0
  );
  
  const showSearchPage = searchText.trim().length > 0;
  
  // --- NEW: ALBUMS SORTED BY PRICE (DESCENDING) ---
  const mostValuableAlbums = [...albums].sort((a, b) => {
    // Treat null/undefined prices as 0 for sorting
    const priceA = a.price ?? 0;
    const priceB = b.price ?? 0;
    // Descending sort (highest price first)
    return priceB - priceA;
  });

  // --- Loading & Error States ---
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading MusicX...</Text>
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

  // --- Main Render ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <Navbar searchText={searchText} setSearchText={setSearchText} />

      {/* --- Conditional Rendering --- */}
      {showSearchPage ? (
        // --- SEARCH RESULTS VIEW ---
        <View style={styles.searchResults}>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Artist Results */}
            {matchingArtists.length > 0 && (
              <View>
                <Text style={styles.resultTitle}>
                  Artists ({matchingArtists.length})
                </Text>
                <FlatList
                  data={matchingArtists}
                  keyExtractor={(item) => item._id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.artistList}
                  renderItem={({ item }) => (
                    // ✅ Updated TouchableOpacity in Search View
                    <TouchableOpacity 
                      style={styles.artistCard}
                      onPress={() => handleArtistPress(item._id)}
                    >
                      <Image source={{ uri: item.image }} style={styles.artistImage}/>
                      <Text style={styles.artistName} numberOfLines={1}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Format Filter */}
            <View style={styles.filterBar}>
              {['All', 'Vinyl', 'CD'].map((format) => (
                <TouchableOpacity
                  key={format}
                  style={[ styles.filterButton, selectedFormat === format && styles.filterButtonActive ]}
                  onPress={() => setSelectedFormat(format)}
                >
                  <Text style={[ styles.filterText, selectedFormat === format && styles.filterTextActive ]}>
                    {format}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Album Results */}
            <Text style={styles.resultTitle}>
              Albums ({filteredAlbums.length})
            </Text>
            <AlbumRow albums={filteredAlbums} artists={artists} genres={genres} />

            {/* Display message if no albums found */}
            {filteredAlbums.length === 0 && matchingArtists.length === 0 && (
                <Text style={styles.noResultsText}>No results found for "{searchText}"</Text>
            )}
          </ScrollView>
        </View>
      ) : (
        // --- HOME VIEW ---
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.rowTitle}>Top Selling Albums</Text>
          <AlbumRow albums={albums} artists={artists} genres={genres} />

          {/* 👇 NOW SORTED BY PRICE DESCENDING 👇 */}
          <Text style={styles.rowTitle}>Most Valuable Albums</Text>
          <AlbumRow albums={mostValuableAlbums} artists={artists} genres={genres} />

          {/* Featured Artists Row */}
          <Text style={styles.rowTitle}>Featured Artists</Text>
          <FlatList
            data={artists}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.artistList}
            renderItem={({ item }) => (
              // ✅ Updated TouchableOpacity in Home View
              <TouchableOpacity
                style={styles.artistCard}
                onPress={() => handleArtistPress(item._id)}
              >
                <Image source={{ uri: item.image }} style={styles.artistImage}/>
                <Text style={styles.artistName} numberOfLines={1}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  loadingText: { color: '#000', marginTop: 10 },
  errorText: { color: 'red', fontSize: 16 },
  scrollView: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { paddingBottom: 20 },
  rowTitle: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 12,
    marginTop: 15,
  },
  // Search Results Specific Styles
  searchResults: { flex: 1, backgroundColor: '#FFF' },
  resultTitle: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 15,
    marginBottom: 10,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#888',
  },
  // Filter Bar Styles
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#EEE',
    backgroundColor: '#FFF',
    marginTop: 10,
  },
  filterButton: {
    backgroundColor: '#F2F2F2',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 10,
  },
  filterButtonActive: { backgroundColor: '#000' },
  filterText: { color: '#000', fontSize: 14, fontWeight: '500' },
  filterTextActive: { color: '#FFF', fontWeight: '700' },
  // Artist List Styles (used in both home and search)
  artistList: {
      paddingHorizontal: 16,
      paddingVertical: 10,
  },
  artistCard: {
    alignItems: 'center',
    width: 100,
    marginRight: 15,
  },
  artistImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
  },
  artistName: {
    color: '#000',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default HomeScreen;