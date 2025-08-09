import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface SearchBarProps {
    onFocus: () => void;
    onBlur: () => void;
    onChangeText: (text: string) => void; // 이 부분을 추가
}

const SearchBar: React.FC<SearchBarProps> = ({ onFocus, onBlur, onChangeText }) => {
    return (
        <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>✨</Text>
            <TextInput
                style={styles.input}
                placeholder="Where to?"
                placeholderTextColor={Colors.searchBarPlaceholder}
                onFocus={onFocus}
                onBlur={onBlur} // onBlur도 props로 받도록 수정
                onChangeText={onChangeText} // 이 부분을 추가

            />
        </View>
    );
};

const styles = StyleSheet.create({
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.searchBarBg,
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    searchIcon: {
        marginRight: 10,
        fontSize: 20,
    },
    input: {
        flex: 1,
        color: Colors.text,
        fontSize: 16,
    },
});

export default SearchBar;
