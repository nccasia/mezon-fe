import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import { memo } from 'react';
import Backdrop from '../../../../../../temp-ui/MezonBottomSheet/backdrop';
import { IDetailReactionBottomSheet } from '../../../types';
import { MessageReactionContent } from './MessageReactionContent';

export const MessageReactionBS = memo((props: IDetailReactionBottomSheet) => {
	const { bottomSheetRef, channelId, allReactionDataOnOneMessage, emojiSelectedId, userId, onClose, removeEmoji, onShowUserInformation } = props;
	const { themeValue } = useTheme();

	return (
		<BottomSheetModal
			ref={bottomSheetRef}
			snapPoints={['50%', '85%']}
			style={{
				borderTopLeftRadius: size.s_14,
				borderTopRightRadius: size.s_14,
				overflow: 'hidden'
			}}
			onDismiss={onClose}
			backdropComponent={Backdrop}
			backgroundStyle={{ backgroundColor: themeValue.primary }}
		>
			<Block flex={1}>
				<MessageReactionContent
					allReactionDataOnOneMessage={allReactionDataOnOneMessage}
					emojiSelectedId={emojiSelectedId}
					userId={userId}
					removeEmoji={removeEmoji}
					onShowUserInformation={onShowUserInformation}
					channelId={channelId}
				/>
			</Block>
		</BottomSheetModal>
	);
});
