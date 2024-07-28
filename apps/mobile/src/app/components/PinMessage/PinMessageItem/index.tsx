import { Icons } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { PinMessageEntity } from '@mezon/store-mobile';
import { Text, TouchableOpacity, View } from 'react-native';
import { RenderTextMarkdownContent } from '../../../screens/home/homedrawer/constants/markdown';
import MezonAvatar from '../../../temp-ui/MezonAvatar';
import { style } from './PinMessageItem.styles';

interface IPinMessageItemProps {
	pinMessageItem: PinMessageEntity;
	handleUnpinMessage: (pinMessageItem: PinMessageEntity) => void;
	contentMessage: string;
}

const PinMessageItem = ({ pinMessageItem, handleUnpinMessage, contentMessage }: IPinMessageItemProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	return (
		<View style={styles.pinMessageItemWrapper}>
			<MezonAvatar avatarUrl={pinMessageItem?.avatar} username={pinMessageItem?.username}></MezonAvatar>
			<View style={styles.pinMessageItemBox}>
				<Text style={styles.pinMessageItemName}>{pinMessageItem?.username}</Text>
				<RenderTextMarkdownContent themeValue={themeValue} content={contentMessage} isEdited={false} />
			</View>
			<View>
				<TouchableOpacity
					style={styles.pinMessageItemClose}
					onPress={() => {
						handleUnpinMessage(pinMessageItem);
					}}
				>
					<Icons.CircleXIcon color={themeValue.text} />
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default PinMessageItem;
