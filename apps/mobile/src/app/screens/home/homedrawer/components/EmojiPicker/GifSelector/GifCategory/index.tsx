import { GifCategoriesEntity } from "@mezon/store-mobile";
import { Text, TouchableOpacity, View } from "react-native";
import FastImage from 'react-native-fast-image';
import styles from "./styles";
import { useGifs, useGifsStickersEmoji } from "@mezon/core";

interface GifCategoryProps {
    loading?: boolean;
    data: GifCategoriesEntity[];
}
export default function GifCategory({ loading, data }: GifCategoryProps) {
    const { fetchGifsDataSearch } = useGifs();
    const { setValueInputSearch } = useGifsStickersEmoji();

    function handlePressCategory(query: string) {
        fetchGifsDataSearch(query);
        setValueInputSearch(query);
    }

    if (loading) {
        return <Text>Loading...</Text>
    }

    return (
        <View style={styles.container}>
            {data.map((item, index) => (
                <TouchableOpacity
                    onPress={() => handlePressCategory(item.searchterm)}
                    style={styles.content}
                    key={index.toString()}>
                    <FastImage source={{ uri: item.image }} style={{ height: "100%", width: "100%" }} />
                    <View style={styles.textWrapper}>
                        <Text style={styles.textTitle}>{item.name}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    )
}