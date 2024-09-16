import { ActionEmitEvent } from '@mezon/mobile-components';
import { attachmentActions, AttachmentEntity } from '@mezon/store';
import { messagesActions, useAppDispatch } from '@mezon/store-mobile';
import { useMezon } from '@mezon/transport';
import { IMessageWithUser } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { ApiUser } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useState } from 'react';
import { DeviceEventEmitter, Keyboard, View } from 'react-native';
import { ImageListModal } from '../../../components/ImageListModal';
import ChannelMessages from './ChannelMessages';
import { MessageItemBS } from './components';
import { ConfirmPinMessageModal } from './components/ConfirmPinMessageModal';
import ForwardMessageModal from './components/ForwardMessage';
import { ReportMessageModal } from './components/ReportMessageModal';
import { EMessageActionType, EMessageBSToShow } from './enums';
import { IConfirmActionPayload, IMessageActionPayload } from './types';

type ChannelMessagesProps = {
	channelId: string;
	parentId: string;
	clanId: string;
	avatarDM?: string;
	mode: ChannelStreamMode;
	isPublic?: boolean;
	isParentPublic?: boolean;
	isDM?: boolean;
};

const ChannelMessagesWrapper = React.memo(({ channelId, parentId, clanId, mode, isPublic, isParentPublic, isDM }: ChannelMessagesProps) => {
	const dispatch = useAppDispatch();
	const { socketRef } = useMezon();
	const [openBottomSheet, setOpenBottomSheet] = useState<EMessageBSToShow | null>(null);
	const [userSelected, setUserSelected] = useState<ApiUser | null>(null);
	const [messageSelected, setMessageSelected] = useState<IMessageWithUser | null>(null);
	const [isOnlyEmojiPicker, setIsOnlyEmojiPicker] = useState<boolean>(false);
	const [senderDisplayName, setSenderDisplayName] = useState('');
	const [imageSelected, setImageSelected] = useState<AttachmentEntity>();

	const [currentMessageActionType, setCurrentMessageActionType] = useState<EMessageActionType | null>(null);

	const [visibleImageModal, setVisibleImageModal] = useState<boolean>(false);

	useEffect(() => {
		return () => {
			dispatch(
				messagesActions.UpdateChannelLastMessage({
					channelId
				})
			);
		};
	}, [channelId, dispatch]);

	useEffect(() => {
		const messageItemBSListener = DeviceEventEmitter.addListener(ActionEmitEvent.SHOW_INFO_USER_BOTTOM_SHEET, ({ isHiddenBottomSheet }) => {
			isHiddenBottomSheet && setOpenBottomSheet(null);
		});

		return () => {
			messageItemBSListener.remove();
		};
	}, []);

	const onDeleteMessage = async (messageId) => {
		const socket = socketRef.current;
		await socket.removeChatMessage(clanId || '', parentId || '', channelId, mode, isPublic, isParentPublic, messageId);
	};

	const onConfirmAction = useCallback(
		(payload: IConfirmActionPayload) => {
			const { type, message } = payload;
			switch (type) {
				case EMessageActionType.DeleteMessage:
					onDeleteMessage(message?.id);
					break;
				case EMessageActionType.ForwardMessage:
				case EMessageActionType.Report:
				case EMessageActionType.PinMessage:
				case EMessageActionType.UnPinMessage:
					setCurrentMessageActionType(type);
					break;
				default:
					break;
			}
		},
		[onDeleteMessage, setCurrentMessageActionType]
	);

	const onOpenImage = useCallback(
		async (image: AttachmentEntity) => {
			await dispatch(attachmentActions.fetchChannelAttachments({ clanId, channelId }));
			setImageSelected(image);
			setVisibleImageModal(true);
		},
		[channelId, clanId, dispatch]
	);

	const onMessageAction = useCallback((payload: IMessageActionPayload) => {
		const { message, type, user, senderDisplayName } = payload;
		switch (type) {
			case EMessageBSToShow.MessageAction:
				setMessageSelected(message);
				setSenderDisplayName(senderDisplayName);
				break;
			case EMessageBSToShow.UserInformation:
				setUserSelected(user);
				setMessageSelected(message);
				break;
			default:
				break;
		}
		Keyboard.dismiss();
		setOpenBottomSheet(type);
	}, []);

	const onCloseModalImage = useCallback(() => {
		setVisibleImageModal(false);
	}, []);

	return (
		<View style={{ flex: 1 }}>
			<ChannelMessages
				channelId={channelId}
				mode={mode}
				onOpenImage={onOpenImage}
				onMessageAction={onMessageAction}
				setIsOnlyEmojiPicker={setIsOnlyEmojiPicker}
				isDM={isDM}
				isPublic={isPublic}
			/>

			<View>
				{visibleImageModal && <ImageListModal visible={visibleImageModal} onClose={onCloseModalImage} imageSelected={imageSelected} />}

				<MessageItemBS
					mode={mode}
					message={messageSelected}
					onConfirmAction={onConfirmAction}
					type={openBottomSheet}
					isOnlyEmojiPicker={isOnlyEmojiPicker}
					onClose={() => {
						setOpenBottomSheet(null);
					}}
					user={userSelected}
					senderDisplayName={senderDisplayName}
					isPublic={isPublic}
				/>

				{currentMessageActionType === EMessageActionType.ForwardMessage && (
					<ForwardMessageModal
						show={currentMessageActionType === EMessageActionType.ForwardMessage}
						onClose={() => setCurrentMessageActionType(null)}
						message={messageSelected}
						isPublic={isPublic}
					/>
				)}

				{currentMessageActionType === EMessageActionType.Report && (
					<ReportMessageModal
						isVisible={currentMessageActionType === EMessageActionType.Report}
						onClose={() => setCurrentMessageActionType(null)}
						message={messageSelected}
					/>
				)}

				{[EMessageActionType.PinMessage, EMessageActionType.UnPinMessage].includes(currentMessageActionType) && (
					<ConfirmPinMessageModal
						isVisible={[EMessageActionType.PinMessage, EMessageActionType.UnPinMessage].includes(currentMessageActionType)}
						onClose={() => setCurrentMessageActionType(null)}
						message={messageSelected}
						type={currentMessageActionType}
					/>
				)}
			</View>
		</View>
	);
});

export default ChannelMessagesWrapper;
