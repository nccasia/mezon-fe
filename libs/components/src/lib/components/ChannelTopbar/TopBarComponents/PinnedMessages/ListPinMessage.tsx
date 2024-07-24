import { useAppParams } from '@mezon/core';
import {
	PinMessageEntity,
	pinMessageActions,
	selectCurrentChannelId,
	selectCurrentClanId,
	selectPinMessageByChannelId,
	useAppDispatch,
} from '@mezon/store';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import EmptyPinMess from './EmptyPinMess';
import ItemPinMessage from './ItemPinMessage';

const ListPinMessage = () => {
	const dispatch = useAppDispatch();
	const { directId } = useAppParams();
	const currentChannelId = useSelector(selectCurrentChannelId);
	const currentClanId = useSelector(selectCurrentClanId);
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

	const checkListPinMessages = useMemo(() => listPinMessages.length <= 0, [listPinMessages.length]);

	useEffect(() => {
		if (!checkListPinMessages) {
			dispatch(
				pinMessageActions.updateLastSeenPin({
					clanId: currentClanId ?? '',
					channelId: currentChannelId ?? '',
					messageId: listPinMessages[listPinMessages.length - 1]?.message_id ?? '',
				}),
			);
		}
	}, [listPinMessages]);

	return (
		<div className='min-h-36'>
			{checkListPinMessages ? (
				<EmptyPinMess />
			) :
				(
					<div className="flex flex-col items-center justify-center space-y-2 py-2">
						{listPinMessages.slice().reverse().map((pinMessage) => {
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
								<ItemPinMessage pinMessage={pinMessage} contentString={contentString} handleUnPinMessage={handleUnPinMessage} key={pinMessage.id} />
							);
						})}
					</div>
				)}
		</div>
	);
};

export default ListPinMessage;
