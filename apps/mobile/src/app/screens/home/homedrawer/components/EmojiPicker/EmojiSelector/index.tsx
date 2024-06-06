import { useEmojiSuggestion } from '@mezon/core';
import {
	BicycleIcon,
	BowlIcon,
	GameControllerIcon,
	HeartIcon,
	LeafIcon,
	ObjectIcon,
	PenIcon,
	RibbonIcon,
	SearchIcon,
	SmilingFaceIcon,
} from '@mezon/mobile-components';
import { Colors, Metrics, size, useAnimatedState } from '@mezon/mobile-ui';
import { selectEmojiImage } from '@mezon/store-mobile';
import { IEmoji } from '@mezon/utils';
import React, { useCallback, useRef, useState } from 'react';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import { useThrottledCallback } from 'use-debounce';
import styles from './styles';

type EmojiSelectorProps = {
	onSelected: (url: string) => void;
	searchText?: string;
	isReactMessage?: boolean;
};

const cateIcon = [
	<PenIcon />,
	<SmilingFaceIcon height={24} width={24} />,
	<LeafIcon />,
	<BowlIcon />,
	<GameControllerIcon />,
	<BicycleIcon />,
	<ObjectIcon />,
	<HeartIcon />,
	<RibbonIcon />,
];

type DisplayByCategoriesProps = {
	readonly categoryName?: string;
	readonly onEmojiSelect: (emoji: string) => void;
	readonly onEmojiHover?: (item: any) => void;
	readonly emojisData: any[];
};

function DisplayByCategories({ emojisData, categoryName, onEmojiSelect, onEmojiHover }: DisplayByCategoriesProps) {
	const getEmojisByCategories = (emojis: any[], categoryParam: string) => {
		return emojis
			.filter((emoji) => emoji.category.includes(categoryParam))
			.map((emoji) => ({
				...emoji,
				category: emoji.category,
			}));
	};
	const emojisByCategoryName = getEmojisByCategories(emojisData, categoryName ?? '');

	return (
		<View style={styles.displayByCategories}>
			<Text style={styles.titleCategories}>{categoryName}</Text>
			<EmojisPanel emojisData={emojisByCategoryName} onEmojiSelect={onEmojiSelect} onEmojiHover={onEmojiHover} />
		</View>
	);
}

const EmojisPanel: React.FC<DisplayByCategoriesProps> = ({ emojisData, onEmojiSelect }) => {
	return (
		<View style={styles.emojisPanel}>
			{emojisData.map((item, index) => {
				return (
					<TouchableOpacity style={styles.wrapperIconEmoji} key={index} onPress={() => onEmojiSelect(item.shortname)}>
						<FastImage source={{ uri: item.src }} style={styles.iconEmoji} resizeMode={'contain'} />
					</TouchableOpacity>
				);
			})}
		</View>
	);
};

export default function EmojiSelector({ onSelected, isReactMessage = false }: EmojiSelectorProps) {
	const [selectedCategory, setSelectedCategory] = useAnimatedState<string>('');
	const { categoriesEmoji, setEmojiSuggestion } = useEmojiSuggestion();
	const emojiListPNG = useSelector(selectEmojiImage);
	const [emojisSearch, setEmojiSearch] = useState<IEmoji[]>();
	const [keywordSearch, setKeywordSearch] = useState<string>('');
	const refScrollView = useRef<ScrollView>(null);
	const categoriesWithIcons = categoriesEmoji.map((category, index) => ({ name: category, icon: cateIcon[index] }));
	const categoryRefs = categoriesWithIcons.reduce((refs, item) => {
		refs[item.name] = { ref: React.createRef(), position: 0 };
		return refs;
	}, {});
	const handleEmojiSelect = useCallback(async (emojiPicked: string) => {
		onSelected(emojiPicked);
		if (!isReactMessage) setEmojiSuggestion(emojiPicked);
	}, []);

	const searchEmojis = (emojis: any[], searchTerm: string) => {
		return emojis.filter((emoji) => emoji.shortname.toLowerCase().includes(searchTerm?.toLowerCase()));
	};

	const onSearchEmoji = async (keyword: string) => {
		setKeywordSearch(keyword);
		const result = searchEmojis(emojiListPNG, keyword);
		setEmojiSearch(result);
	};

	const typingSearchDebounce = useThrottledCallback((text) => onSearchEmoji(text), 500);

	return (
		<ScrollView
			ref={refScrollView}
			showsVerticalScrollIndicator={false}
			stickyHeaderIndices={[0]}
			style={{ height: Metrics.screenHeight / (Platform.OS === 'ios' ? 1.4 : 1.3) }}
			contentContainerStyle={{ paddingBottom: size.s_50 }}
		>
			<View style={{ backgroundColor: isReactMessage ? Colors.bgCharcoal : Colors.secondary }}>
				<View style={styles.textInputWrapper}>
					<SearchIcon height={18} width={18} />
					<TextInput style={styles.textInput} onChangeText={(text) => typingSearchDebounce(text)} />
				</View>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={styles.wrapperCateContainer}
					contentContainerStyle={styles.cateContainer}
				>
					{categoriesWithIcons.map((item, index) => (
						<TouchableOpacity
							key={index}
							onPress={() => {
								setSelectedCategory(item.name);
								refScrollView.current?.scrollTo({
									y: categoryRefs[item.name].position,
									animated: true,
								});
							}}
							style={{
								...styles.cateItem,
								backgroundColor: item.name === selectedCategory ? Colors.bgViolet : 'transparent',
							}}
						>
							{item.icon}
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>

			{keywordSearch ? (
				<EmojisPanel emojisData={emojisSearch || []} onEmojiSelect={handleEmojiSelect} />
			) : (
				categoriesWithIcons.map((item, index) => {
					return (
						<View
							ref={categoryRefs[item.name].ref} // Pass the ref here
							onLayout={(event) => {
								categoryRefs[item.name].position = event.nativeEvent.layout.y;
							}}
						>
							<DisplayByCategories
								key={index + item.name?.toString()}
								emojisData={emojiListPNG}
								onEmojiSelect={handleEmojiSelect}
								categoryName={item.name}
							/>
						</View>
					);
				})
			)}
		</ScrollView>
	);
}
