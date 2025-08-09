import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import AIIcon from './AIIcon';

interface SearchBarProps {
    onFocus: () => void;
    onBlur: () => void;
    onChangeText: (text: string) => void; // 이 부분을 추가
}

const SearchBar: React.FC<SearchBarProps> = ({ onFocus, onBlur, onChangeText }) => {
    return (
        <View style={styles.searchBar}>
            <AIIcon size={20} color={Colors.searchIcon} />
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
        borderRadius: 300,
        paddingHorizontal: 24,
        paddingVertical: 12,
        height: 45,
    },
    input: {
        flex: 1,
        color: Colors.secondaryText,
        fontSize: 16,
        fontFamily: 'Pretendard-Regular',
        letterSpacing: -0.32,
        marginLeft: 12,
    },
});

export default SearchBar;
