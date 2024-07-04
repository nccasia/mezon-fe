import { useAppNavigation, useJumpToMessage, useNotification } from '@mezon/core';
import {
	INotification,
	referencesActions,
	selectChannelById,
	selectCurrentChannelId,
	selectCurrentClan,
	selectMemberByUserId,
	selectMemberClanByUserId,
	selectMessageByMessageId,
} from '@mezon/store';
import { IMessageWithUser } from '@mezon/utils';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AvatarImage } from '../AvatarImage/AvatarImage';
import MessageHead from '../MessageWithUser/MessageHead';
import MarkUpOnReply from '../MessageWithUser/MessageReply/MarkUpOnReply';
import MessageReply from '../MessageWithUser/MessageReply/MessageReply';
import { useMessageLine } from '../MessageWithUser/useMessageLine';
export type NotifyMentionProps = {
	readonly notify: INotification;
};

function parseObject(obj: any) {
	let attachments;
	let mentions;
	let reactions;
	let references;
	try {
		attachments = JSON.parse(obj.attachments);
	} catch (err) {
		attachments = {};
	}
	try {
		mentions = JSON.parse(obj.mentions);
	} catch (err) {
		mentions = {};
	}
	try {
		references = JSON.parse(obj.references);
	} catch (err) {
		references = {};
	}
	try {
		reactions = JSON.parse(obj.reactions);
	} catch (err) {
		reactions = {};
	}
	const parsedObj = {
		...obj,
		attachments: attachments,
		mentions: mentions,
		reactions: reactions,
		references: references,
	};
	return parsedObj;
}

function NotifyMentionItem({ notify }: NotifyMentionProps) {
	const dispatch = useDispatch();
	const { deleteNotify } = useNotification();
	const user = useSelector(selectMemberClanByUserId(notify.sender_id || ''));
	const currentClan = useSelector(selectCurrentClan);
	const channelInfo = useSelector(selectChannelById(notify.content.channel_id));
	const data = parseObject(notify.content);
	const messageId = notify.content.message_id;
	const { toChannelPage, navigate } = useAppNavigation();
	const { jumpToMessage } = useJumpToMessage();
	const currentChannelId = useSelector(selectCurrentChannelId);
	const message = useSelector(selectMessageByMessageId(messageId));
	data.content = JSON.parse(data.content);
	data.update_time = data.create_time;
	const dispatchMessageMention = async () => {
		if (currentChannelId !== data.channel_id) {
			await navigate(toChannelPage(data.channel_id, currentClan?.id ?? ''));
			dispatch(referencesActions.setMessageMentionId(data.message_id));
		} else {
			jumpToMessage(data.message_id);
		}
	};

	return (
		<div className="flex flex-col gap-2 py-3 px-3 w-full">
			<div className="flex justify-between">
				<div className="flex flex-row items-center gap-2">
					<div>
						{currentClan?.logo ? (
							<img
								src={currentClan.logo}
								className="rounded-full size-10 object-cover max-w-10 max-h-10 min-w-10 min-h-10"
								alt={currentClan.logo}
							/>
						) : (
							<div>
								{currentClan?.clan_name && (
									<div className="w-[45px] h-[45px] bg-bgDisable flex justify-center items-center text-contentSecondary text-[20px] rounded-xl">
										{currentClan.clan_name.charAt(0).toUpperCase()}
									</div>
								)}
							</div>
						)}
					</div>
					<div className="flex flex-col gap-1">
						<div className="font-bold text-[16px] cursor-pointer flex gap-x-1">
							# <p className=" hover:underline">{channelInfo?.channel_label}</p>
						</div>
						<div className="text-[10px] uppercase">
							{currentClan?.clan_name} {'>'} {channelInfo?.category_name}
						</div>
					</div>
				</div>
				<button
					className="dark:bg-bgTertiary bg-bgLightModeButton mr-1 dark:text-contentPrimary text-colorTextLightMode rounded-full w-6 h-6 flex items-center justify-center text-[10px]"
					onClick={() => {
						deleteNotify(notify.id);
					}}
				>
					✕
				</button>
			</div>
			<div className="dark:bg-bgTertiary bg-transparent rounded-[8px] relative group">
				<button
					className="absolute py-1 px-2 dark:bg-bgSecondary bg-bgLightModeButton top-[10px] z-50 right-3 text-[10px] rounded-[6px] transition-all duration-300 group-hover:block hidden"
					onClick={() => {
						dispatchMessageMention();
					}}
				>
					Jump
				</button>
				{message !== undefined && <MentionTabContent message={message} />}
			</div>
		</div>
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
	const senderMessage = useSelector(selectMemberByUserId(message?.sender_id));

	const checkMessageHasReply = useMemo(() => {
		return message.references && message.references?.length > 0;
	}, [message.references]);
	return (
		<div className="flex flex-col p-2 bg-[#FFFFFF] dark:bg-[#313338] rounded-lg ">
			{checkMessageHasReply && (
				<div className="max-w-full overflow-hidden">
					<MessageReply message={message} />
				</div>
			)}

			<div className="flex flex-row p-1 w-full gap-4  rounded-lg bg-[#FFFFFF] dark:bg-[#313338]">
				<AvatarImage alt="user avatar" className="w-15 h-15" userName={senderMessage?.user?.username} src={senderMessage?.user?.avatar_url} />

				<div className="h-full ">
					<MessageHead message={message} user={senderMessage} isCombine={true} isShowFull={true} />
					<MarkUpOnReply posMention={true} onClickToMove={(e) => getIdMessageToJump(message?.id, e)} mention={mentions} />
				</div>
			</div>
		</div>
	);
}
