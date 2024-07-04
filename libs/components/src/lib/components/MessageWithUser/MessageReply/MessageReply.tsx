import { referencesActions, selectMemberByUserId, selectMessageByMessageId } from '@mezon/store';
import { IMessageWithUser } from '@mezon/utils';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AvatarImage } from '../../AvatarImage/AvatarImage';
import * as Icons from '../../Icons/index';
import { useMessageLine } from '../useMessageLine';
import MarkUpOnReply from './MarkUpOnReply';
type MessageReplyProps = {
	message: IMessageWithUser;
};

// TODO: refactor component for message lines
const MessageReply: React.FC<MessageReplyProps> = ({ message }) => {
	const [messageRefId, setMessageId] = useState<string>('');
	const [senderId, setSenderId] = useState<string>('');
	const messageRefFetchFromServe = useSelector(selectMessageByMessageId(messageRefId));
	const senderMessage = useSelector(selectMemberByUserId(senderId));
	const dispatch = useDispatch();

	const getIdMessageToJump = useCallback(
		(idRefMessage: string, e: React.MouseEvent<HTMLDivElement | HTMLSpanElement>) => {
			e.stopPropagation();
			if (idRefMessage) {
				dispatch(referencesActions.setIdMessageToJump(idRefMessage));
				dispatch(referencesActions.setIdReferenceMessageReply(''));
			}
		},
		[dispatch],
	);

	const [messageLine, setMessageLine] = useState<string>('');
	const { mentions } = useMessageLine(messageLine);

	useEffect(() => {
		if (messageRefFetchFromServe !== undefined && messageRefFetchFromServe?.content.t !== '') {
			setMessageLine(messageRefFetchFromServe.content.t ?? '');
		}
	}, [messageRefFetchFromServe?.content.t]);

	useEffect(() => {
		if (message.references && message.references.length > 0) {
			const messageReferenceId = message.references[0].message_ref_id;
			const messageReferenceUserId = message.references[0].message_sender_id;
			setMessageId(messageReferenceId ?? '');
			setSenderId(messageReferenceUserId ?? '');
		}
	}, [message]);

	return (
		<div>
			{messageRefFetchFromServe && senderMessage && message.references && message?.references.length > 0 && (
				<div className="rounded flex flex-row gap-1 items-center justify-start w-fit text-[14px] ml-5 mb-[-5px] mt-1 replyMessage">
					<Icons.ReplyCorner />
					<div className="flex flex-row gap-1 mb-2 pr-12 items-center">
						<div className="w-5 h-5">
							<AvatarImage
								className="w-5 h-5"
								alt="user avatar"
								userName={senderMessage?.user?.username}
								src={senderMessage?.user?.avatar_url}
							/>
						</div>

						<div className="gap-1 flex flex-row items-center">
							<span className=" text-[#84ADFF] font-bold hover:underline cursor-pointer tracking-wide">
								@{senderMessage.user?.username}{' '}
							</span>
							{message.references[0].has_attachment ? (
								<div className=" flex flex-row items-center">
									<div
										onClick={(e) => getIdMessageToJump(messageRefId, e)}
										className="text-[14px] pr-1 mr-[-5px] dark:hover:text-white dark:text-[#A8BAB8] text-[#818388]  hover:text-[#060607] cursor-pointer italic   w-fit one-line break-all pt-0"
									>
										Click to see attachment
									</div>
									<Icons.ImageThumbnail />
								</div>
							) : mentions.length > 0 ? (
								<MarkUpOnReply onClickToMove={(e) => getIdMessageToJump(messageRefId, e)} mention={mentions} />
							) : (
								<span
									onClick={(e) => getIdMessageToJump(messageRefId, e)}
									className="text-[14px] dark:hover:text-white dark:text-[#A8BAB8] text-[#818388]  hover:text-[#060607] cursor-pointer one-line break-all pt-0"
								>
									{messageRefFetchFromServe?.content?.t}
								</span>
							)}
						</div>
					</div>
				</div>
			)}
			{!messageRefFetchFromServe && message.references && message?.references.length > 0 && (
				<div className="rounded flex flex-row gap-1 items-center justify-start w-fit text-[14px] ml-5 mb-[-5px] mt-1 replyMessage">
					<Icons.ReplyCorner />
					<div className="flex flex-row gap-1 mb-2 pr-12 items-center">
						<div className="rounded-full dark:bg-bgSurface bg-bgLightModeButton size-4">
							<Icons.IconReplyMessDeleted />
						</div>
						<i className="dark:text-zinc-400 text-colorTextLightMode text-[13px]">Original message was deleted</i>
					</div>
				</div>
			)}
		</div>
	);
};

export default MessageReply;
