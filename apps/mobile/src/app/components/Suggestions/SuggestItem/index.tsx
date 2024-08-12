import { useTheme } from '@mezon/mobile-ui';
import { Image, Text, View } from 'react-native';
import { style } from './SuggestItem.styles';
import { getSrcEmoji } from '@mezon/utils';

type SuggestItemProps = {
	avatarUrl?: string;
	symbol?: string;
	name: string;
	subText?: string;
	isDisplayDefaultAvatar?: boolean;
	isRoleUser?: boolean;
	emojiId?: string;
};

const SuggestItem = ({ avatarUrl, symbol, name, subText, isDisplayDefaultAvatar, isRoleUser, emojiId }: SuggestItemProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const emojiSrc = emojiId ? getSrcEmoji(emojiId) : '';
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
					!isRoleUser &&
					isDisplayDefaultAvatar && (
						<View style={styles.avatarMessageBoxDefault}>
							<Text style={styles.textAvatarMessageBoxDefault}>{name?.charAt(0)?.toUpperCase()}</Text>
						</View>
					)
				)}
				{emojiSrc && <Image style={styles.emojiImage} source={{ uri: emojiSrc }} />}
				{symbol && <Text style={styles.symbol}>{symbol}</Text>}
				{isRoleUser || name.startsWith('here') ? (
					<Text style={[styles.roleText, name.startsWith('here') && styles.textHere]}>{`@${name}`}</Text>
				) : (
					<Text style={styles.title}>{name}</Text>
				)}
			</View>
			<Text style={styles.subText}>{subText}</Text>
		</View>
	);
};

export default SuggestItem;
