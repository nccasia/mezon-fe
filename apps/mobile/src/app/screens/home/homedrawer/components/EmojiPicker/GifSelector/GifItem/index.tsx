import { GifEntity } from "@mezon/store-mobile";
import { Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import styles from "./styles";
import { useEffect } from "react";

interface GifItemProps {
    loading?: boolean;
    data: GifEntity[];
    onPress?: (url: string) => void;
}

export default function GiftItem({ loading, data, onPress }: GifItemProps) {
    if (loading) {
        return <Text>loading...</Text>
    }

    function handlePressGif(url: string) {
        onPress && onPress(url);
    }

    return (
        <View style={styles.container}>
            {data && Array.isArray(data) && (
                data.map((item, index) => (
                    <TouchableOpacity
                        style={styles.content}
                        onPress={() => handlePressGif(item.media_formats.gif.url)}
                        key={index.toString()}
                    >
                        <FastImage
                            source={{ uri: item.media_formats.gif.url }}
                            style={{ height: "100%", width: "100%" }} />
                    </TouchableOpacity>
                ))
            )}
        </View>
    )
}