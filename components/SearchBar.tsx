import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, Platform, TouchableWithoutFeedback } from 'react-native';
import { Colors } from '../constants/Colors';
import AIIcon from './AIIcon';

interface SearchBarProps {
    onFocus: () => void;
    onBlur: () => void;
    onChangeText: (text: string) => void;
    onSubmitEditing: () => void;
    value?: string; // 검색어 값을 제어하기 위해 추가
}

const SearchBar: React.FC<SearchBarProps> = ({ onFocus, onBlur, onChangeText, onSubmitEditing, value }) => {
    const inputRef = useRef<TextInput>(null);
    
    // 웹에서 검색바 전체를 클릭했을 때 입력 필드에 포커스
    const handleSearchBarPress = () => {
        if (Platform.OS === 'web' && inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <TouchableWithoutFeedback onPress={handleSearchBarPress}>
            <View style={[styles.searchBar, Platform.OS === 'web' ? { cursor: 'text' as any } : {}]}>
                <AIIcon size={20} color={Colors.searchIcon} />
                <TextInput
                    ref={inputRef}
                    style={[styles.input, Platform.OS === 'web' ? { outline: 'none' } : {}]}
                    placeholder="Where to?"
                    placeholderTextColor={Colors.searchBarPlaceholder}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onChangeText={onChangeText}
                    onSubmitEditing={onSubmitEditing}
                    value={value}
                    autoCapitalize="none"
                    autoCorrect={false}
                    // 웹에서 더 나은 접근성을 위한 속성들
                    {...(Platform.OS === 'web' && {
                        accessibilityRole: 'searchbox' as any,
                        'aria-label': 'Search for places' as any,
                        autoComplete: 'off' as any,
                    })}
                />
            </View>
        </TouchableWithoutFeedback>
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
