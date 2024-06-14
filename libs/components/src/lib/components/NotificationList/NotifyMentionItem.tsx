import { useAppNavigation, useClans, useJumpToMessage, useNotification, useReference } from '@mezon/core';
import { INotification, selectChannelById, selectCurrentChannelId, selectMemberClanByUserId } from '@mezon/store';
import { IChannelMember } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { useSelector } from 'react-redux';
import MessageWithUser from '../MessageWithUser';
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
	const { deleteNotify } = useNotification();
	const user = useSelector(selectMemberClanByUserId(notify.sender_id || ''));
	const { currentClan } = useClans();
	const channelInfo = useSelector(selectChannelById(notify.content.channel_id));
	const data = parseObject(notify.content);
	const { toChannelPage, navigate } = useAppNavigation();
	const { jumpToMessage } = useJumpToMessage();
	const { setMessageMentionId } = useReference();
	const currentChannelId = useSelector(selectCurrentChannelId);

	data.content = JSON.parse(data.content);
	data.update_time = data.create_time;
	const dispatchMessageMention = async () => {
		if (currentChannelId !== data.channel_id) {
			await navigate(toChannelPage(data.channel_id, currentClan?.id ?? ''));
			setMessageMentionId(data.message_id);
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
							<img src={currentClan.logo} className="rounded-full size-10 object-cover" alt={currentClan.logo} />
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
				<MessageWithUser
					message={data}
					user={user as IChannelMember}
					isMessNotifyMention={true}
					mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
					newMessage={""}
					isMention={true}
				/>
			</div>
		</div>
	);
}

export default NotifyMentionItem;
