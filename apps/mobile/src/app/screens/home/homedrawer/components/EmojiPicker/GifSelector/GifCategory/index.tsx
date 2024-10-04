import { useGifs, useGifsStickersEmoji } from '@mezon/core';
import { Colors } from '@mezon/mobile-ui';
import { Text, TouchableOpacity, View } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import FastImage from 'react-native-fast-image';
import styles from './styles';

interface GifCategoryProps {
	loading?: boolean;
	data: any;
}
export default function GifCategory({ loading, data }: GifCategoryProps) {
	const { fetchGifsDataSearch } = useGifs();
	const { setValueInputSearch } = useGifsStickersEmoji();

	function handlePressCategory(query: string) {
		fetchGifsDataSearch(query);
		setValueInputSearch(query);
	}

	if (loading) {
		return (
			<View style={styles.containerLoading}>
				<Flow color={Colors.bgViolet} />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{!!data?.length &&
				data?.map?.((item, index) => (
					<TouchableOpacity onPress={() => handlePressCategory(item.searchterm)} style={styles.content} key={index.toString()}>
						<FastImage source={{ uri: item.image }} style={{ height: '100%', width: '100%' }} />
						<View style={styles.textWrapper}>
							<Text style={styles.textTitle}>{item.name}</Text>
						</View>
					</TouchableOpacity>
				))}
		</View>
	);
}
