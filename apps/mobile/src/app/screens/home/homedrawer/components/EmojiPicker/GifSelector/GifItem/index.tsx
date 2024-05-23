import { GifEntity } from "@mezon/store-mobile";
import { Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import styles from "./styles";
import { useEffect } from "react";
import { useCallback } from "react";
import { IMessageSendPayload } from "@mezon/utils";
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from "mezon-js/api.gen";

interface GifItemProps {
    loading?: boolean;
    data: GifEntity[];
    onPress?: (url: string) => void;
}

export default function GiftItem({ loading, data, onPress }: GifItemProps) {
    useEffect(() => {
        // console.log(data);
        // console.log("aaa");
        // console.log(data && Array.isArray(data), data && Array.isArray(data) && data.length);
        // data && Array.isArray(data) && data.forEach((item) => console.log(item.media_formats.gif.url))
    }, [data])

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