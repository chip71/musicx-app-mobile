import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  FlatList,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import AlbumCard from '../components/AlbumCard'; // Reuses AlbumCard

const API_URL = "https://musicx-mobile-backend.onrender.com";
console.log("🔗 Using API:", API_URL);


const { width } = Dimensions.get('window');

const Api = {
  fetchArtistById: async (id) =>
    (await axios.get(`${API_URL}/api/artists/${id}`)).data,
  fetchAlbumsByArtist: async (id) =>
    (await axios.get(`${API_URL}/api/albums/artist/${id}`)).data,
};

const ArtistDetailScreen = ({ route, navigation }) => {
  const { artistId } = route.params;

  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artistResponse, albumsResponse] = await Promise.all([
          Api.fetchArtistById(artistId),
          Api.fetchAlbumsByArtist(artistId),
        ]);

        setArtist(artistResponse);
        setAlbums(albumsResponse);
      } catch (err) {
        console.error('Error fetching artist data:', err);
        setError('Failed to load artist details. Check API connection.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [artistId]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading Artist...</Text>
      </View>
    );
  }

  if (error || !artist) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Artist not found.'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButtonWrapper}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Artist Details
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* --- Artist Header Section --- */}
        <View style={styles.profileSection}>
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: artist.image }}
              style={styles.artistImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.artistName}>{artist.name}</Text>
          <Text style={styles.albumCount}>{albums.length} Albums</Text>
        </View>

        {/* --- Social Links --- */}
        <View style={styles.socialLinksContainer}>
          {artist.spotify && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => Linking.openURL(artist.spotify)}
            >
              <FontAwesome name="spotify" size={35} color="#1DB954" />
            </TouchableOpacity>
          )}
          {artist.youtube && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => Linking.openURL(artist.youtube)}
            >
              <Ionicons name="logo-youtube" size={35} color="#FF0000" />
            </TouchableOpacity>
          )}
        </View>

        {/* --- Description --- */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>About</Text>
          <Text style={styles.descriptionText}>
            {artist.description || 'No description available.'}
          </Text>
        </View>

        {/* --- Albums Section --- */}
        <View style={styles.albumSection}>
          <Text style={styles.sectionTitle}>Discography</Text>
          {albums.length > 0 ? (
            <FlatList
              data={albums}
              keyExtractor={(item) => item._id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.row}
              renderItem={({ item }) => (
                <View style={styles.cardWrapper}>
                  <AlbumCard
                    album={item}
                    artist={artist}
                    genre={item.genreID}
                  />
                </View>
              )}
            />
          ) : (
            <Text style={styles.emptyText}>No albums found for this artist.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#000', marginTop: 10 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButtonWrapper: { paddingRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },

  // Artist Section
  profileSection: {
    alignItems: 'center',
    paddingVertical: 35,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    backgroundColor: '#FAFAFA',
  },
  imageWrapper: {
    width: width * 0.46,
    height: width * 0.46,
    borderRadius: (width * 0.46) / 2,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#d4af37',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 15,
  },
  artistImage: {
    width: '100%',
    height: '100%',
    borderRadius: (width * 0.46) / 2,
  },
  artistName: { fontSize: 26, fontWeight: 'bold', color: '#000' },
  albumCount: { fontSize: 15, color: '#666', marginTop: 4 },

  // Social
  socialLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  iconButton: { marginHorizontal: 20 },

  // Description
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  descriptionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  descriptionText: { fontSize: 16, color: '#333', lineHeight: 24 },

  // Albums
  albumSection: { padding: 20 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  row: { justifyContent: 'space-between' },
  cardWrapper: { width: '50%', padding: 5 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 10 },
});

export default ArtistDetailScreen;
