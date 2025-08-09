import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

interface DetailHeaderProps {
    imageUrl: string;
}

const DetailHeader: React.FC<DetailHeaderProps> = ({ imageUrl }) => {
    return <ImageBackground source={{ uri: imageUrl }} style={styles.headerImage} />;
};

const styles = StyleSheet.create({
    headerImage: {
        width: '100%',
        height: 250,
    },
});

export default DetailHeader;
