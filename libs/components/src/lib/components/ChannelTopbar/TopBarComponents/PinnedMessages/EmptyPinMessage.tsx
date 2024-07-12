import { PinMessageEntity, pinMessageActions, selectCurrentChannelId, selectCurrentClanId, selectPinMessageByChannelId, useAppDispatch } from '@mezon/store';
import { useSelector } from 'react-redux';
import MemberProfile from '../../../MemberProfile';
import MessageLine from '../../../MessageWithUser/MessageLine';
import { useAppParams } from '@mezon/core';
import { useEffect } from 'react';

type EmptyPinMessageProps = {
	onClick?: () => void;
};

const EmptyPinMessage = ({ onClick }: EmptyPinMessageProps) => {
	const dispatch = useAppDispatch();
	const { directId } = useAppParams();
	const currentChannelId = useSelector(selectCurrentChannelId);
	const currentClanId = useSelector(selectCurrentClanId)
	const dmChannelId = useSelector(selectPinMessageByChannelId(directId));
	const clanChannelId = useSelector(selectPinMessageByChannelId(currentChannelId));
	let listPinMessages: PinMessageEntity[] = [];

	if (dmChannelId) {
		listPinMessages = dmChannelId;
	} else if (clanChannelId) {
		listPinMessages = clanChannelId;
	}

	const handleUnPinMessage = (messageId: string) => {
		const channelId = directId || currentChannelId || '';
		dispatch(pinMessageActions.deleteChannelPinMessage({ channel_id: channelId || '', message_id: messageId }));
	};

	useEffect(() => {
		if (listPinMessages.length) {
			dispatch(pinMessageActions.updateLastSeenPin({ clanId: currentClanId ?? '', channelId: currentChannelId ?? '', messageId: listPinMessages[listPinMessages.length - 1]?.message_id ?? '' }))
		}
	}, []);

	return (
		<div>
			{listPinMessages.length <= 0 ? (
				<div className="flex flex-col items-center justify-center ">
					<div className="flex flex-col items-center py-16 px-7 dark:bg-bgSecondary bg-gray-100">
						<p className="text-base font-medium dark:text-gray-300 text-colorTextLightMode text-center">
							This channel doesn't have any pinned messages... yet.
						</p>
					</div>
					<div className="flex flex-col items-center h-[106px] dark:bg-[#1E1F22] bg-white p-4 w-full">
						<h2 className="text-sm text-[#2DC770] font-bold mb-2">PROTIP:</h2>
						<p className="text-sm font-normal dark:text-gray-300 text-colorTextLightMode text-center">
							Users with 'Manage Messages' permission can pin a message from its context menu.
						</p>
					</div>
				</div>
			) : (
				<div className="flex flex-col items-center justify-center ">
					{listPinMessages.reverse().map((pinMessage) => {
						// Parse content if it's a JSON string
						let contentString = pinMessage.content;
						if (typeof contentString === 'string') {
							try {
								const contentObject = JSON.parse(contentString);
								contentString = contentObject.t;
							} catch (e) {
								console.error('Failed to parse content JSON:', e);
							}
						}

						return (
							<div
								key={pinMessage.id}
								className="flex flex-row justify-between dark:hover:bg-bgSecondaryHover dark:bg-bgSecondary hover:bg-bgLightModeThird bg-bgLightMode dark: py-3 px-3 w-full cursor-pointer"
							>
								<div className="flex items-center gap-2">
									<MemberProfile
										isHideUserName={true}
										avatar={pinMessage.avatar || ''}
										name={pinMessage.username ?? ''}
										isHideStatus={true}
										isHideIconStatus={true}
										textColor="#fff"
									/>
									<div className="flex flex-col gap-1 text-left">
										<div>
											<span className="font-bold dark:text-textDarkTheme text-textLightTheme">{pinMessage.username}</span>
										</div>
										<span className="text-zinc-400 text-[11px]">
											<MessageLine line={contentString as string} />
										</span>
									</div>
								</div>
								<button
									className="dark:bg-bgTertiary bg-bgLightModeButton mr-1 dark:text-contentPrimary text-colorTextLightMode rounded-full w-6 h-6 flex items-center justify-center text-[10px] px-3 py-2"
									onClick={() => {
										handleUnPinMessage(pinMessage.message_id || '');
									}}
								>
									✕
								</button>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default EmptyPinMessage;