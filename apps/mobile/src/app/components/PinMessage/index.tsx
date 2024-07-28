import { Metrics, size, useTheme } from '@mezon/mobile-ui';
import {
	AppDispatch,
	PinMessageEntity,
	pinMessageActions,
	selectAllEmojiSuggestion,
	selectChannelsEntities,
	selectPinMessageByChannelId,
} from '@mezon/store-mobile';
import { Platform, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import EmptyPinMessage from './EmptyPinMessage';
import { style } from './PinMessage';
import PinMessageItem from './PinMessageItem';

const PinMessage = ({ currentChannelId }: { currentChannelId: string }) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const listPinMessages = useSelector(selectPinMessageByChannelId(currentChannelId));

	const dispatch = useDispatch<AppDispatch>();

	const handleUnpinMessage = (message: PinMessageEntity) => {
		const channelId = currentChannelId;
		dispatch(pinMessageActions.deleteChannelPinMessage({ channel_id: channelId, message_id: message.id }));
	};

	return (
		<ScrollView
			style={{ height: Metrics.screenHeight / (Platform.OS === 'ios' ? 1.4 : 1.3) }}
			contentContainerStyle={{ paddingBottom: size.s_50 }}
			showsVerticalScrollIndicator={false}
		>
			<View style={styles.containerPinMessage}>
				{listPinMessages?.length ? (
					listPinMessages.map((pinMessage) => {
						let contentString = pinMessage?.content;
						if (typeof contentString === 'string') {
							try {
								contentString = JSON.parse(contentString);
							} catch (e) {
								console.error('Failed to parse content JSON:', e);
							}
						}

						return (
							<PinMessageItem
								pinMessageItem={pinMessage}
								contentMessage={contentString}
								handleUnpinMessage={handleUnpinMessage}
							/>
						);
					})
				) : (
					<EmptyPinMessage />
				)}
			</View>
		</ScrollView>
	);
};

export default PinMessage;
