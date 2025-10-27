import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Navbar = ({ searchText, setSearchText, showSearch = true }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* --- Top Row: Logo + Icons --- */}
      <View style={styles.topHeader}>
        <Text style={styles.logo}>MUSICX</Text>

        <View style={styles.headerIcons}>
          {/* <TouchableOpacity onPress={() => navigation.navigate('CartScreen')}>
            <Ionicons name="cart-outline" size={24} color="#000" />
          </TouchableOpacity> */}

          <TouchableOpacity style={{ marginLeft: 18 }}>
            <Ionicons name="mail-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- Search Bar (optional) --- */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search-outline" size={18} color="#555" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search MusicX"
              placeholderTextColor="#888"
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    paddingTop: 10,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    backgroundColor: '#FFF',
  },
  logo: {
    color: '#000',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#000',
    fontSize: 16,
    paddingVertical: 0,
    marginLeft: 8,
  },
});

export default Navbar;
