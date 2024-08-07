import { selectCurrentChannel, selectMemberByUserId } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { ChannelIsNotThread } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { useSelector } from 'react-redux';
import { AvatarImage } from '../AvatarImage/AvatarImage';

export type ChatWelComeProp = {
	readonly name?: Readonly<string>;
	readonly avatarDM?: Readonly<string>;
	userName?: string;
	mode: number;
};

function ChatWelCome({ name, userName, avatarDM, mode }: ChatWelComeProp) {
	const currentChannel = useSelector(selectCurrentChannel);
	const user = useSelector(selectMemberByUserId(currentChannel?.creator_id as string));
	const classNameSubtext = 'dark:text-zinc-400 text-colorTextLightMode text-sm';
	const showName = <span className="font-medium">{name || userName}</span>;

	return (
		<div className="space-y-2 px-4 mb-0 mt-[50px] flex-1 flex flex-col justify-end">
			{mode === ChannelStreamMode.STREAM_MODE_CHANNEL &&
				(currentChannel?.parrent_id !== ChannelIsNotThread.TRUE ? (
					<div className="h-[75px] w-[75px] rounded-full bg-bgLightModeButton dark:bg-zinc-700 flex items-center justify-center pl-2">
						<Icons.ThreadIcon defaultFill="#ffffff" defaultSize="w-10 h-10" />
					</div>
				) : (
					<div className="h-[75px] w-[75px] rounded-full bg-bgLightModeButton dark:bg-zinc-700 flex items-center justify-center pl-2">
						<Icons.Hashtag defaultFill="#ffffff" defaultSize="w-10 h-10 mb-2" />
					</div>
				))}
			{(mode === ChannelStreamMode.STREAM_MODE_DM || mode === ChannelStreamMode.STREAM_MODE_GROUP) && (
				<AvatarImage
					alt={userName || ''}
					userName={userName}
					className="min-w-[75px] min-h-[75px] max-w-[75px] max-h-[75px] font-semibold"
					src={avatarDM}
					classNameText="!text-4xl font-semibold"
				/>
			)}

			<div>
				<p className="text-xl md:text-3xl font-bold pt-1 dark:text-white text-black" style={{ wordBreak: 'break-word' }}>
					Welcome to #{name || userName}
				</p>
			</div>
			<div className="text-base">
				{mode === ChannelStreamMode.STREAM_MODE_CHANNEL &&
					(currentChannel?.parrent_id !== ChannelIsNotThread.TRUE ? (
						<p className={classNameSubtext}>
							Started by <span className="dark:text-white text-black font-medium">{user?.user?.username}</span>
						</p>
					) : (
						<p className={classNameSubtext}>
							This is the start of the #{showName} {currentChannel?.channel_private ? 'private' : ''} channel
						</p>
					))}
				{mode === ChannelStreamMode.STREAM_MODE_DM && (
					<p className={classNameSubtext}>This is the beginning of your direct message history with {showName}</p>
				)}
				{mode === ChannelStreamMode.STREAM_MODE_GROUP && (
					<p className={classNameSubtext}>Welcome to the beginning of the #{showName} group</p>
				)}
			</div>
		</div>
	);
}

export default ChatWelCome;
