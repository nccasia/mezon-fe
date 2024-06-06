import { useGifs, useGifsStickersEmoji } from '@mezon/core';
import { Metrics, size } from '@mezon/mobile-ui';
import { GifCategoriesEntity } from '@mezon/store-mobile';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import GifCategory from './GifCategory';
import GiftItem from './GifItem';

type GifSelectorProps = {
	onSelected: (url: string) => void;
	searchText: string;
};

export default function GifSelector({ onSelected, searchText }: GifSelectorProps) {
	const [gifData, setGifData] = useState<any>();

	const {
		dataGifCategories,
		dataGifsSearch,
		loadingStatusGifs,
		dataGifsFeartured,
		trendingClickingStatus,
		setButtonArrowBack,
		fetchGifsDataSearch,
	} = useGifs();

	const { valueInputToCheckHandleSearch, setValueInputSearch } = useGifsStickersEmoji();

	useEffect(() => {
		fetchGifsDataSearch(searchText);
		setValueInputSearch(searchText);
	}, [searchText]);

	useEffect(() => {
		if (dataGifsSearch.length > 0 && valueInputToCheckHandleSearch !== '') {
			setGifData(dataGifsSearch);
		} else if (trendingClickingStatus) {
			setGifData(dataGifsFeartured);
		} else if (valueInputToCheckHandleSearch === '') {
			setButtonArrowBack(false);
		}
	}, [dataGifsSearch, trendingClickingStatus, valueInputToCheckHandleSearch]);

	function handleGifPress(url: string) {
		onSelected && onSelected(url);
	}

	return (
		<ScrollView style={{ maxHeight: Metrics.screenHeight / 1.4 }} contentContainerStyle={{ paddingBottom: size.s_50 * 2 }}>
			{valueInputToCheckHandleSearch === '' ? (
				<GifCategory loading={loadingStatusGifs === 'loading'} data={dataGifCategories as unknown as GifCategoriesEntity[]} />
			) : (
				<GiftItem loading={loadingStatusGifs === 'loading'} data={gifData} onPress={handleGifPress} />
			)}
		</ScrollView>
	);
}
