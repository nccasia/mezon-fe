import { useTheme } from '@mezon/mobile-ui';
import { selectAllEmojiSuggestion } from '@mezon/store-mobile';
import { getSrcEmoji } from '@mezon/utils';
import { Image, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { style } from './SuggestItem.styles';

type SuggestItemProps = {
	avatarUrl?: string;
	symbol?: string;
	name: string;
	subText?: string;
	isDisplayDefaultAvatar?: boolean;
};

const SuggestItem = ({ avatarUrl, symbol, name, subText, isDisplayDefaultAvatar }: SuggestItemProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const emojiListPNG = useSelector(selectAllEmojiSuggestion);
	const urlEmoji = getSrcEmoji(name, emojiListPNG);
	return (
		<View style={styles.wrapperItem}>
			<View style={styles.containerItem}>
				{avatarUrl ? (
					<Image
						style={styles.image}
						source={{
							uri: avatarUrl,
						}}
					/>
				) : (
					!name.startsWith('here') &&
					isDisplayDefaultAvatar && (
						<View style={styles.avatarMessageBoxDefault}>
							<Text style={styles.textAvatarMessageBoxDefault}>{name?.charAt(0)?.toUpperCase()}</Text>
						</View>
					)
				)}
				{urlEmoji && <Image style={styles.emojiImage} source={{ uri: urlEmoji }} />}
				{symbol && <Text style={styles.symbol}>{symbol}</Text>}
				<Text style={styles.title}>{name}</Text>
			</View>
			<Text style={styles.subText}>{subText}</Text>
		</View>
	);
};

export default SuggestItem;
