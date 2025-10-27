import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AlbumCard from './AlbumCard';

// Accepts albums, artists, AND genres
const AlbumRow = ({ title, albums, artists, genres }) => {

  // Helper to get Artist Name: Matches album.artistID (ObjectId string) against master artists list
  const getArtist = (artistID) => {
    if (!artistID) return { name: 'Unknown Artist' };
    
    return artists.find((a) => a._id === artistID) || { name: 'Unknown Artist' };
  };

  // Helper to get Genre Name: Matches album.genreID (ObjectId string) against master genres list
  const getGenre = (genreID) => {
    if (!genreID) return { name: 'Unknown Genre' };

    return genres.find((g) => g._id === genreID) || { name: 'Unknown Genre' };
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.rowTitle}>{title}</Text>}

      <FlatList
        data={albums}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.albumList}
        renderItem={({ item }) => (
          <AlbumCard
            album={item}
            artist={getArtist(item.artistID)}
            genre={getGenre(item.genreID)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  rowTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 12,
    color: '#000',
  },
  albumList: {
    paddingHorizontal: 16,
  },
});

export default AlbumRow;