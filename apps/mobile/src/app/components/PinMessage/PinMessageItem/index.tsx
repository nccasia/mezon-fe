import { CloseIcon } from '@mezon/mobile-components';
import { Colors } from '@mezon/mobile-ui';
import { ChannelsEntity, PinMessageEntity } from '@mezon/store-mobile';
import { IEmoji } from '@mezon/utils';
import { Text, TouchableOpacity, View } from 'react-native';
import { renderTextContent } from '../../../screens/home/homedrawer/constants/markdown';
import MezonAvatar from '../../../temp-ui/MezonAvatar';
import { styles } from './PinMessageItem.styles';

interface IPinMessageItemProps {
	pinMessageItem: PinMessageEntity;
	handleUnpinMessage: (pinMessageItem: PinMessageEntity) => void;
	contentMessage: string;
	channelsEntities: Record<string, ChannelsEntity>;
	emojiListPNG: IEmoji[];
}

const PinMessageItem = ({ pinMessageItem, handleUnpinMessage, contentMessage, channelsEntities, emojiListPNG }: IPinMessageItemProps) => {
	return (
		<View style={styles.pinMessageItemWrapper}>
			<MezonAvatar avatarUrl={pinMessageItem?.avatar} userName={pinMessageItem?.username}></MezonAvatar>
			<View style={styles.pinMessageItemBox}>
				<Text style={styles.pinMessageItemName}>{pinMessageItem?.username}</Text>
				{renderTextContent({ lines: contentMessage, isEdited: false, channelsEntities, emojiListPNG})}
			</View>
			<View>
				<TouchableOpacity
					style={styles.pinMessageItemClose}
					onPress={() => {
						handleUnpinMessage(pinMessageItem);
					}}
				>
					<CloseIcon width={20} height={20} color={Colors.textGray} />
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default PinMessageItem;
