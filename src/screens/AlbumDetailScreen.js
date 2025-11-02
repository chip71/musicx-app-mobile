import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Linking, ActivityIndicator, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import AlbumRow from '../components/AlbumRow'; // Used for recommendations

// --- API URL SETUP ---
const API_URL =
  Platform.OS === 'web'
    ? 'http://localhost:9999'
    : 'http://192.168.137.1:9999';

// --- API CALLS ---
const Api = {
  fetchAlbumById: async (id) => {
    const response = await axios.get(`${API_URL}/api/albums/${id}`);
    return response.data;
  },
  fetchAlbumsByArtist: async (artistId, currentAlbumId) => {
    const response = await axios.get(
      `${API_URL}/api/albums/artist/${artistId}?exclude=${currentAlbumId}`
    );
    return response.data;
  },
  fetchRecommendedAlbums: async (genreId, currentAlbumId) => {
    const response = await axios.get(
      `${API_URL}/api/albums/genre/${genreId}?exclude=${currentAlbumId}`
    );
    return response.data;
  },
  fetchArtists: async () => (await axios.get(`${API_URL}/api/artists`)).data,
  fetchGenres: async () => (await axios.get(`${API_URL}/api/genres`)).data,
};

const AlbumDetailScreen = ({ route, navigation }) => {
  const { albumId } = route.params;
  const { addToCart, user } = useAuth();

  const [album, setAlbum] = useState(null);
  const [recommendedAlbums, setRecommendedAlbums] = useState([]);
  const [artistAlbums, setArtistAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!albumId) return;
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const fetchedAlbum = await Api.fetchAlbumById(albumId);
        const [allArtists, allGenres] = await Promise.all([
          Api.fetchArtists(),
          Api.fetchGenres(),
        ]);
        setArtists(allArtists);
        setGenres(allGenres);
        setAlbum(fetchedAlbum);

        const genreIdString = fetchedAlbum.genreID?._id;
        const artistIdString = fetchedAlbum.artistID?._id;

        if (genreIdString) {
          const recommended = await Api.fetchRecommendedAlbums(genreIdString, albumId);
          setRecommendedAlbums(recommended);
        }

        if (artistIdString) {
          const artistRecs = await Api.fetchAlbumsByArtist(artistIdString, albumId);
          const filtered = artistRecs.filter(a => a._id !== albumId);
          setArtistAlbums(filtered);
        }

      } catch (err) {
        console.error('❌ Failed to fetch album details/recommendations:', err);
        setError('Could not load album details. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [albumId]);

  const handleAddToCart = () => {
    if (!album || !album.stock || album.stock <= 0) {
      return; // stock check
    }
    addToCart(album);
    navigation.navigate('MainTabs', { screen: 'Cart' });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading Album...</Text>
      </View>
    );
  }

  if (error || !album) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Album not found.'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { name, image, artistID, genreID, price, currency, stock, format, sku, description, spotify, youtube } = album;
  const genreName = genreID?.name || 'Related';
  const artistName = artistID?.name || 'This Artist';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Navbar showSearch={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topSection}>
          <Image
            source={{ uri: image || 'https://via.placeholder.com/150' }}
            style={styles.albumImage}
            resizeMode="cover"
          />
          <View style={styles.coreInfo}>
            <Text style={styles.albumName}>{name}</Text>
            <Text style={styles.artistName}>{artistName}</Text>
            <Text style={styles.genreText}>Genre: {genreID?.name || 'Unknown'}</Text>
            <Text style={styles.priceText}>{price ? `${price.toLocaleString()} ${currency || 'VND'}` : '—'}</Text>
            <Text style={styles.stockText}>
              {stock && stock > 0 ? (
                <>In Stock: <Text style={{ fontWeight: 'bold' }}>{stock}</Text></>
              ) : (
                <Text style={{ color: 'red', fontWeight: 'bold' }}>SOLD OUT</Text>
              )}
            </Text>
          </View>
        </View>

        {(spotify || youtube) && (
          <View style={styles.socialLinksContainer}>
            {spotify && (
              <TouchableOpacity style={styles.iconButton} onPress={() => Linking.openURL(spotify)}>
                <FontAwesome name="spotify" size={35} color="#1DB954" />
              </TouchableOpacity>
            )}
            {youtube && (
              <TouchableOpacity style={styles.iconButton} onPress={() => Linking.openURL(youtube)}>
                <Ionicons name="logo-youtube" size={35} color="#FF0000" />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Format:</Text>
            <Text style={styles.detailValue}>{format || '—'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>SKU:</Text>
            <Text style={styles.detailValue}>{sku || '—'}</Text>
          </View>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{description || 'No description available.'}</Text>

          {stock && stock > 0 && (
            <>
              {user?.role !== 'admin' ? (
                <TouchableOpacity style={styles.buyButton} onPress={handleAddToCart}>
                  <Text style={styles.buyButtonText}>Add to Cart</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.adminTooltip}>Admins cannot buy items</Text>
              )}
            </>
          )}

        </View>

        {artistAlbums.length > 0 && (
          <View style={styles.recommendationSection}>
            <Text style={styles.recommendationTitle}>More from {artistName}</Text>
            <AlbumRow albums={artistAlbums} artists={artists} genres={genres} />
          </View>
        )}

        {recommendedAlbums.length > 0 && (
          <View style={styles.recommendationSection}>
            <Text style={styles.recommendationTitle}>More {genreName} Music</Text>
            <AlbumRow albums={recommendedAlbums} artists={artists} genres={genres} />
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  errorText: { color: 'red', fontSize: 16, marginBottom: 20 },
  backButton: { color: '#007AFF', fontSize: 16 },
  topSection: { flexDirection: 'row', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  albumImage: { width: 150, height: 150, borderRadius: 8, marginRight: 15 },
  coreInfo: { flex: 1, justifyContent: 'space-between' },
  albumName: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  artistName: { fontSize: 16, color: '#555', marginBottom: 5 },
  genreText: { fontSize: 14, color: '#777' },
  priceText: { fontSize: 20, fontWeight: 'bold', color: '#000', marginTop: 10 },
  stockText: { fontSize: 14, color: 'green' },
  socialLinksContainer: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  iconButton: { marginHorizontal: 20 },
  detailSection: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 10, marginTop: 15 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  detailLabel: { fontSize: 16, color: '#555', fontWeight: '500' },
  detailValue: { fontSize: 16, color: '#000' },
  descriptionText: { fontSize: 16, color: '#333', lineHeight: 24 },
  buyButton: { backgroundColor: '#000', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  buyButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  recommendationSection: { marginTop: 20, marginBottom: 20, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 },
  recommendationTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginLeft: 16, marginBottom: 12 },
  adminTooltip: {
  color: '#ff0000ff',
  fontSize: 14,
  textAlign: 'center',
  marginTop: 20,
  fontStyle: 'italic',
},

});

export default AlbumDetailScreen;
