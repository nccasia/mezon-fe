import { useEmojiSuggestion } from '@mezon/core';
import {
	BicycleIcon,
	BowlIcon,
	GameControllerIcon,
	HeartIcon,
	Icons,
	LeafIcon,
	ObjectIcon,
	PenIcon,
	RibbonIcon,
	SmilingFaceIcon
} from '@mezon/mobile-components';
import { baseColor, Colors, Metrics, size, useAnimatedState, useTheme } from '@mezon/mobile-ui';
import { selectAllEmojiSuggestion } from '@mezon/store-mobile';
import { IEmoji } from '@mezon/utils';
import { debounce } from 'lodash';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { ScrollView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { style } from './styles';

type EmojiSelectorProps = {
	onSelected: (url: string) => void;
	searchText?: string;
	isReactMessage?: boolean;
	onScroll?: (e: any) => void;
	handleBottomSheetExpand?: () => void;
	handleBottomSheetCollapse?: () => void;
};


type DisplayByCategoriesProps = {
	readonly categoryName?: string;
	readonly onEmojiSelect: (emoji: string) => void;
	readonly onEmojiHover?: (item: any) => void;
	readonly emojisData: any[];
};

function DisplayByCategories({ emojisData, categoryName, onEmojiSelect, onEmojiHover }: DisplayByCategoriesProps) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
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
	const { themeValue } = useTheme();
	const styles = style(themeValue);
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

export default function EmojiSelector({
	onScroll,
	onSelected,
	isReactMessage = false,
	handleBottomSheetExpand,
	handleBottomSheetCollapse,
}: EmojiSelectorProps) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const [selectedCategory, setSelectedCategory] = useAnimatedState<string>('');
	const { categoriesEmoji, setEmojiSuggestion } = useEmojiSuggestion();
	const emojiListPNG = useSelector(selectAllEmojiSuggestion);
	const [emojisSearch, setEmojiSearch] = useState<IEmoji[]>();
	const [keywordSearch, setKeywordSearch] = useState<string>('');
	const refScrollView = useRef<ScrollView>(null);
	const { t } = useTranslation('message');
	const cateIcon = useMemo(() => ([
		<PenIcon color={themeValue.textStrong} />,
		<SmilingFaceIcon height={24} width={24} color={themeValue.textStrong} />,
		<LeafIcon color={themeValue.textStrong} />,
		<BowlIcon color={themeValue.textStrong} />,
		<GameControllerIcon color={themeValue.textStrong} />,
		<BicycleIcon color={themeValue.textStrong} />,
		<ObjectIcon color={themeValue.textStrong} />,
		<HeartIcon color={themeValue.textStrong} />,
		<RibbonIcon color={themeValue.textStrong} />,
	]), [themeValue]);
	const categoriesWithIcons = categoriesEmoji.map((category, index) => ({ name: category, icon: cateIcon[index] }));
	const categoryRefs = useRef(
		categoriesEmoji.reduce((refs, item) => {
			refs[item] = { position: 0 };
			return refs;
		}, {}),
	);

	const handleEmojiSelect = useCallback(async (emojiPicked: string) => {
		onSelected(emojiPicked);
		handleBottomSheetCollapse?.();
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

	const debouncedSetSearchText = useCallback(
		debounce((text) => onSearchEmoji(text), 300),
		[],
	);

	return (
		<ScrollView
			ref={refScrollView}
			showsVerticalScrollIndicator={false}
			stickyHeaderIndices={[0]}
			scrollEventThrottle={16}
			onScroll={onScroll}
			style={{ height: Metrics.screenHeight / (Platform.OS === 'ios' ? 1.4 : 1.3) }}
			contentContainerStyle={{ paddingBottom: size.s_50 }}
		>
			<View style={{ backgroundColor: themeValue.secondary }}>
				<View style={styles.textInputWrapper}>
					<Icons.MagnifyingIcon height={18} width={18} color={themeValue.text} />
					<TextInput
						onFocus={handleBottomSheetExpand}
						placeholder={t('findThePerfectReaction')}
						style={styles.textInput}
						placeholderTextColor={Colors.textGray}
						onChangeText={debouncedSetSearchText}
					/>
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
									y: categoryRefs.current[item.name].position - 130,
									animated: true,
								});
							}}
							style={{
								...styles.cateItem,
								backgroundColor: item.name === selectedCategory ? baseColor.blurple : 'transparent',
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
							ref={categoryRefs.current[item.name]} // Pass the ref here
							onLayout={(event) => {
								categoryRefs.current[item.name].position = event.nativeEvent.layout.y;
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
