import React from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Place } from '@/data/mockData';
import Animated, {FadeIn, FadeInDown, FadeOut} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import {router} from "expo-router";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface SearchSuggestionsProps {
    suggestions: Place[];
    isLoading: boolean; // 로딩 상태를 props로 받음
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ suggestions, isLoading }) => {
    const handlePlaceSelect = (place: Place) => {
        // 스트리밍 플레이리스트 생성 페이지로 이동
        router.push({
            pathname: "/playlist-generation",
            params: {
                destination: place.name,
                season: "사계절",
                playlistSize: "10", // 최소 5곡으로 수정
            },
        });
    };
    // 로딩 중이거나, 로딩이 끝났지만 보여줄 제안이 없는 경우
    // 둘 다 렌더링하지 않으면 부모 컴포넌트에서 애니메이션 상태와 충돌할 수 있음
    // 따라서 로딩 상태와 제안 목록 상태를 컴포넌트 내부에서 함께 처리

    const hasSuggestions = suggestions.length > 0;

    // 로딩 중이 아니고, 제안도 없으면 아무것도 보여주지 않음
    if (!isLoading && !hasSuggestions) {
        return null;
    }

    return (
        <Animated.View
            style={styles.listContainer}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
        >
            {isLoading ? (
                // 로딩 중일 때는 고정된 높이를 가진 컨테이너를 보여줌
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={Colors.text} />
                </View>
            ) : (
                // 제안이 있을 때만 FlatList를 렌더링
                <FlatList
                    data={suggestions}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <AnimatedTouchableOpacity
                            style={styles.suggestionItem}
                            entering={FadeInDown.duration(200).delay(index * 50)}
                            onPress={() => handlePlaceSelect(item)}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons name="location-sharp" size={24} color={Colors.text} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.nameText}>{item.name}</Text>
                                <Text style={styles.addressText}>{item.address}</Text>
                            </View>
                        </AnimatedTouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={true}
                    scrollEnabled={true}
                />
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        marginTop: 10,
        backgroundColor: Colors.searchBarBg,
        borderRadius: 15,
        overflow: 'hidden', // borderRadius가 자식 요소에 적용되도록
        maxHeight: 300,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    iconContainer: {
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    nameText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Pretendard-SemiBold',
    },
    addressText: {
        color: Colors.searchBarPlaceholder,
        fontSize: 12,
        marginTop: 2,
        fontFamily: 'Pretendard-Regular',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20, // 로딩 인디케이터 주변에 여백 추가
        height: 100,

    },

});

export default SearchSuggestions;
