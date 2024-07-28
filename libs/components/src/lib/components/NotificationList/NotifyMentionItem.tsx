import { useJumpToMessage, useNotification } from '@mezon/core';
import { INotification, notificationActions, referencesActions, selectClanById } from '@mezon/store';
import { IMessageWithUser } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AvatarImage } from '../AvatarImage/AvatarImage';
import MessageHead from '../MessageWithUser/MessageHead';
import MarkUpOnReply from '../MessageWithUser/MessageReply/MarkUpOnReply';
import MessageReply from '../MessageWithUser/MessageReply/MessageReply';
import { useMessageLine } from '../MessageWithUser/useMessageLine';
import { useMessageParser } from '../MessageWithUser/useMessageParser';
export type NotifyMentionProps = {
	readonly notify: INotification;
	readonly isUnreadTab?: boolean;
};

function convertContentToObject(notify: any) {
	if (notify && notify.content && typeof notify.content === 'object') {
		try {
			const parsedContent = {
				...notify.content,
				content: JSON.parse(notify.content.content),
				mentions: JSON.parse(notify.content.mentions),
				reactions: JSON.parse(notify.content.reactions),
				references: JSON.parse(notify.content.references),
				attachments: JSON.parse(notify.content.attachments),
			};

			return {
				...notify,
				content: parsedContent,
			};
		} catch (error) {
			return notify;
		}
	}
	return notify;
}

function NotifyMentionItem({ notify, isUnreadTab }: NotifyMentionProps) {
	const parseNotify = convertContentToObject(notify);
	const dispatch = useDispatch();
	const { deleteNotify } = useNotification();
	const messageId = useMemo(() => {
		if (parseNotify.content) {
			return parseNotify.content.message_id;
		}
	}, [parseNotify.content.message_id]);

	const channelId = useMemo(() => {
		if (parseNotify.content) {
			return parseNotify.content.channel_id;
		}
	}, [parseNotify.content.channel_id]);

	const clanId = useMemo(() => {
		if (parseNotify.content) {
			return parseNotify.content.clan_id;
		}
	}, [parseNotify.content.clan_id]);

	const notiId = useMemo(() => {
		return parseNotify.id;
	}, [parseNotify.id]);

	//
	const channelName = useMemo(() => {
		return parseNotify.content.channel_label;
	}, [parseNotify.content.channel_label]);

	const categoryName = useMemo(() => {
		return parseNotify.content.category_name;
	}, [parseNotify.content.category_name]);

	const clanLogo = useMemo(() => {
		return parseNotify.content.clan_logo;
	}, [parseNotify.content.clan_logo]);

	const clan = useSelector(selectClanById(clanId));

	const { directToMessageById } = useJumpToMessage({ channelId: channelId, messageID: messageId, clanId: clanId });

	const handleMarkAsRead = useCallback(() => {
		dispatch(notificationActions.setReadNotiStatus(notiId));
		dispatch(notificationActions.setStatusNoti());
	}, []);

	const handleClickJump = useCallback(() => {
		dispatch(referencesActions.setIdMessageToJump(messageId));
		directToMessageById();
		handleMarkAsRead();
	}, []);

	const handleClickDeleteMessage = useCallback(() => {
		handleMarkAsRead();
		deleteNotify(notiId);
	}, []);

	return (
		<>
			{' '}
			{clan && (
				<div className="flex flex-col gap-2 py-3 px-3 w-full">
					<div className="flex justify-between">
						<div className="flex flex-row items-center gap-2">
							<div>
								{clanLogo ? (
									<img src={clan.logo} className="w-[45px] h-[45px] rounded-xl" alt={clan.logo} />
								) : (
									<div>
										{clan?.clan_name && (
											<div className="w-[45px] h-[45px] bg-bgDisable flex justify-center items-center text-contentSecondary text-[20px] rounded-xl">
												{clan.clan_name.charAt(0).toUpperCase()}
											</div>
										)}
									</div>
								)}
							</div>

							<div className="flex flex-col gap-1">
								<div className="font-bold text-[16px] cursor-pointer flex gap-x-1">
									# <p className=" hover:underline">{channelName}</p>
								</div>
								<div className="text-[10px] uppercase">
									{clan?.clan_name} {'>'} {categoryName}
								</div>
							</div>
						</div>

						<div className="flex flex-row">
							{isUnreadTab && (
								<button
									className="dark:bg-bgTertiary bg-bgLightModeButton mr-1 dark:text-contentPrimary text-colorTextLightMode rounded-full w-6 h-6 flex items-center justify-center text-[10px]"
									onClick={handleMarkAsRead}
								>
									✔
								</button>
							)}

							<button
								className="dark:bg-bgTertiary bg-bgLightModeButton mr-1 dark:text-contentPrimary text-colorTextLightMode rounded-full w-6 h-6 flex items-center justify-center text-[10px]"
								onClick={handleClickDeleteMessage}
							>
								✕
							</button>
						</div>
					</div>
					<div className="dark:bg-bgTertiary bg-transparent rounded-[8px] relative group">
						<button
							className="absolute py-1 px-2 dark:bg-bgSecondary bg-bgLightModeButton top-[10px] z-50 right-3 text-[10px] rounded-[6px] transition-all duration-300 group-hover:block hidden"
							onClick={handleClickJump}
						>
							Jump
						</button>
						{<MentionTabContent message={parseNotify.content} />}
					</div>
				</div>
			)}
		</>
	);
}

export default NotifyMentionItem;

interface IMentionTabContent {
	message: IMessageWithUser;
}

function MentionTabContent({ message }: IMentionTabContent) {
	const dispatch = useDispatch();
	const { mentions } = useMessageLine(message?.content?.t ?? '');
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

	const checkMessageHasReply = useMemo(() => {
		return message.references && message.references?.length > 0;
	}, [message.references]);

	const { username } = useMessageParser(message);

	return (
		<div className="flex flex-col p-2 bg-[#FFFFFF] dark:bg-[#313338] rounded-lg ">
			{checkMessageHasReply && (
				<div className="max-w-full overflow-hidden">
					<MessageReply message={message} />
				</div>
			)}

			<div className="flex flex-row p-1 w-full gap-4  rounded-lg bg-[#FFFFFF] dark:bg-[#313338]">
				<AvatarImage alt="user avatar" className="w-15 h-15" userName={username} src={message.avatar} />

				<div className="h-full ">
					<MessageHead message={message} isCombine={true} isShowFull={true} />
					<MarkUpOnReply posMention={true} onClickToMove={(e) => getIdMessageToJump(message?.id, e)} mention={mentions} />
				</div>
			</div>
		</div>
	);
}
