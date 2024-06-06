import { selectEmojiImage } from '@mezon/store-mobile';
import { getSrcEmoji } from '@mezon/utils';
import { Image, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { styles as s } from './SuggestItem.styles';

type SuggestItemProps = {
	avatarUrl?: string;
	symbol?: string;
	name: string;
	subText?: string;
	isDisplayDefaultAvatar?: boolean;
};

const SuggestItem = ({ avatarUrl, symbol, name, subText, isDisplayDefaultAvatar }: SuggestItemProps) => {
	const emojiListPNG = useSelector(selectEmojiImage);
	const urlEmoji = getSrcEmoji(name, emojiListPNG);
	return (
		<View style={s.wrapperItem}>
			<View style={s.containerItem}>
				{avatarUrl ? (
					<Image
						style={s.image}
						source={{
							uri: avatarUrl,
						}}
					/>
				) : (
					!name.startsWith('here') &&
					isDisplayDefaultAvatar && (
						<View style={s.avatarMessageBoxDefault}>
							<Text style={s.textAvatarMessageBoxDefault}>{name?.charAt(0)?.toUpperCase()}</Text>
						</View>
					)
				)}
				{urlEmoji && <Image style={s.emojiImage} source={{ uri: urlEmoji }} />}
				{symbol && <Text style={s.symbol}>{symbol}</Text>}
				<Text style={s.title}>{name}</Text>
			</View>
			<Text style={s.subText}>{subText}</Text>
		</View>
	);
};

export default SuggestItem;
