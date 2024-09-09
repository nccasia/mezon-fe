import { useAppParams, useFriends } from '@mezon/core';
import { selectCurrentChannel, selectDirectById, selectFriendStatus, selectMemberClanByUserId, selectUserIdCurrentDm } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { ChannelIsNotThread } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import { AvatarImage } from '../AvatarImage/AvatarImage';

export type ChatWelComeProp = {
	readonly name?: Readonly<string>;
	readonly avatarDM?: Readonly<string>;
	userName?: string;
	mode: number;
};

function ChatWelCome({ name, userName, avatarDM, mode }: ChatWelComeProp) {
	const { directId } = useAppParams();
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const currentChannel = directId ? useSelector(selectDirectById(directId as string)) : useSelector(selectCurrentChannel);
	const user = useSelector(selectMemberClanByUserId(currentChannel?.creator_id as string));
	const classNameSubtext = 'dark:text-zinc-400 text-colorTextLightMode text-sm';
	const showName = <span className="font-medium">{name || userName}</span>;

	const isChannel = mode === ChannelStreamMode.STREAM_MODE_CHANNEL;
	const isChannelThread = currentChannel?.parrent_id !== ChannelIsNotThread.TRUE;
	const isDm = mode === ChannelStreamMode.STREAM_MODE_DM;
	const isDmGroup = mode === ChannelStreamMode.STREAM_MODE_GROUP;

	return (
		<div className="space-y-2 px-4 mb-0 mt-[50px] flex-1 flex flex-col justify-end">
			{isChannel &&
				(isChannelThread ? (
					<WelcomeChannelThread name={name} classNameSubtext={classNameSubtext} userName={user?.user?.username} />
				) : (
					<WelComeChannel
						name={name}
						classNameSubtext={classNameSubtext}
						showName={showName}
						channelPrivate={Boolean(currentChannel?.channel_private)}
					/>
				))}
			{(isDm || isDmGroup) && (
				<WelComeDm
					name={name || `${currentChannel?.creator_name}'s Groups`}
					userName={userName}
					avatar={avatarDM}
					classNameSubtext={classNameSubtext}
					showName={showName}
					isDmGroup={isDmGroup}
				/>
			)}
		</div>
	);
}

export default ChatWelCome;

type WelComeChannelProps = {
	name?: string;
	classNameSubtext: string;
	showName: JSX.Element;
	channelPrivate: boolean;
};

const WelComeChannel = (props: WelComeChannelProps) => {
	const { name = '', classNameSubtext, showName, channelPrivate } = props;
	return (
		<>
			<div className="h-[75px] w-[75px] rounded-full bg-bgLightModeButton dark:bg-zinc-700 flex items-center justify-center pl-2">
				<Icons.Hashtag defaultFill="#ffffff" defaultSize="w-10 h-10 mb-2" />
			</div>
			<div>
				<p className="text-xl md:text-3xl font-bold pt-1 dark:text-white text-black" style={{ wordBreak: 'break-word' }}>
					Welcome to #{name}
				</p>
			</div>
			<p className={classNameSubtext}>
				This is the start of the #{showName} {channelPrivate ? 'private' : ''} channel
			</p>
		</>
	);
};

type WelcomeChannelThreadProps = {
	name?: string;
	classNameSubtext: string;
	userName?: string;
};

const WelcomeChannelThread = (props: WelcomeChannelThreadProps) => {
	const { name = '', classNameSubtext, userName = '' } = props;
	return (
		<>
			<div className="h-[75px] w-[75px] rounded-full bg-bgLightModeButton dark:bg-zinc-700 flex items-center justify-center pl-2">
				<Icons.ThreadIcon defaultFill="#ffffff" defaultSize="w-10 h-10" />
			</div>
			<div>
				<p className="text-xl md:text-3xl font-bold pt-1 dark:text-white text-black" style={{ wordBreak: 'break-word' }}>
					{name}
				</p>
			</div>
			<p className={classNameSubtext}>
				Started by <span className="dark:text-white text-black font-medium">{userName}</span>
			</p>
		</>
	);
};

type WelComeDmProps = {
	name?: string;
	userName?: string;
	avatar?: string;
	classNameSubtext: string;
	showName: JSX.Element;
	isDmGroup: boolean;
};

const WelComeDm = (props: WelComeDmProps) => {
	const { name = '', userName = '', avatar = '', classNameSubtext, showName, isDmGroup } = props;
	const usernameDm = userName.slice(0, -1);
	return (
		<>
			<AvatarImage
				alt={userName}
				userName={userName}
				className="min-w-[75px] min-h-[75px] max-w-[75px] max-h-[75px] font-semibold"
				src={avatar}
				classNameText="!text-4xl font-semibold"
			/>
			<div>
				<p className="text-xl md:text-3xl font-bold pt-1 dark:text-white text-black" style={{ wordBreak: 'break-word' }}>
					{name}
				</p>
			</div>
			{!isDmGroup && <p className="font-medium text-2xl dark:text-textDarkTheme text-textLightTheme">{usernameDm}</p>}
			<div className="text-base">
				<p className={classNameSubtext}>
					{isDmGroup ? (
						<>Welcome to the beginning of the {showName} group.</>
					) : (
						<>This is the beginning of your direct message history with {showName}</>
					)}
				</p>
			</div>
			{!isDmGroup && <StatusFriend userName={usernameDm} />}
		</>
	);
};

type StatusFriendProps = {
	userName?: string;
};

const StatusFriend = memo((props: StatusFriendProps) => {
	const { userName = '' } = props;
	const userID = useSelector(selectUserIdCurrentDm);
	const checkAddFriend = useSelector(selectFriendStatus(userID[0] || ''));
	const { acceptFriend, deleteFriend, addFriend } = useFriends();
	return (
		<div className="flex gap-x-2 items-center text-sm">
			{checkAddFriend.myPendingFriend && (
				<>
					<p className="dark:text-contentTertiary text-colorTextLightMode">Sent you a friend request:</p>
					<button
						className="rounded bg-bgSelectItem px-4 py-0.5 hover:bg-opacity-85 font-medium text-white"
						onClick={() => {
							acceptFriend(userName, userID[0]);
						}}
					>
						Accept
					</button>
					<button
						className="rounded bg-bgModifierHover px-4 py-0.5 hover:bg-opacity-85 font-medium text-white"
						onClick={() => {
							deleteFriend(userName, userID[0]);
						}}
					>
						Ignore
					</button>
				</>
			)}
			{checkAddFriend.friend && (
				<button
					className="rounded bg-bgModifierHover px-4 py-0.5 hover:bg-opacity-85 font-medium text-white"
					onClick={() => {
						deleteFriend(userName, userID[0]);
					}}
				>
					Remove Friend
				</button>
			)}
			{checkAddFriend.otherPendingFriend && (
				<button
					className="rounded bg-bgSelectItem opacity-50 cursor-not-allowed px-4 py-0.5 hover:bg-opacity-85 font-medium text-white"
					onClick={() => console.log(1)}
				>
					Friend Request Sent
				</button>
			)}
			{checkAddFriend.noFriend && (
				<button
					className="rounded bg-bgSelectItem px-4 py-0.5 hover:bg-opacity-85 font-medium text-white"
					onClick={() => {
						addFriend({
							ids: userID,
							usernames: [userName]
						});
					}}
				>
					Add Friend
				</button>
			)}
			<button className="rounded bg-bgModifierHover px-4 py-0.5 hover:bg-opacity-85 font-medium text-white">Block</button>
		</div>
	);
});
