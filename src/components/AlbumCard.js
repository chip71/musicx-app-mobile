import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

const AlbumCard = ({ album }) => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const handlePress = () => {
    navigation.navigate('AlbumDetail', { albumId: album._id });
  };

  const isSoldOut = !album.stock || album.stock <= 0;

  // Hiệu ứng fade + zoom cho badge
  useEffect(() => {
    if (isSoldOut) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSoldOut]);

  const getDisplayArtist = () => album?.artistID?.name || 'Unknown Artist';
  const getDisplayGenre = () => album?.genreID?.name || '';

  return (
    <View style={styles.cardContainer}>
      <Pressable onPress={handlePress}>
        <Image
          style={[styles.image, isSoldOut && { opacity: 0.5 }]}
          source={{ uri: album.image }}
          resizeMode="cover"
        />

        {isSoldOut && (
          <Animated.View
            style={[
              styles.soldOutBadge,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            {Platform.OS !== 'web' ? (
              <BlurView intensity={50} tint="dark" style={styles.blurContainer}>
                <Text style={styles.soldOutText}>SOLD OUT</Text>
              </BlurView>
            ) : (
              <View style={[styles.blurContainer, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                <Text style={styles.soldOutText}>SOLD OUT</Text>
              </View>
            )}
          </Animated.View>
        )}
      </Pressable>

      <Text style={styles.title} numberOfLines={1}>
        {album.name}
      </Text>
      <Text style={styles.artist} numberOfLines={1}>
        {getDisplayArtist()}
      </Text>
      <Text style={styles.genreText} numberOfLines={1}>
        {getDisplayGenre()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 160,
    marginRight: 12,
    marginBottom: 16,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 8,
  },
  artist: {
    fontSize: 12,
    color: '#666',
  },
  genreText: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  soldOutBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 10,
  },
  blurContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default AlbumCard;
