import { selectCurrentChannel, selectMemberByUserId } from '@mezon/store';
import { ETypeMessage } from '@mezon/utils';
import { useSelector } from 'react-redux';
import { Hashtag, ThreadIcon } from '../../../../../ui/src/lib/Icons';

export type ChatWelComeProp = {
	readonly type: Readonly<string>;
	readonly name?: Readonly<string>;
	readonly avatarDM?: Readonly<string>;
	userName?: string
};

function ChatWelCome({ type, name, userName, avatarDM }: ChatWelComeProp) {
	const currentChannel = useSelector(selectCurrentChannel);
	const user = useSelector(selectMemberByUserId(currentChannel?.creator_id as string));
	return (
		<div className="space-y-2 px-4 mb-0 mt-[50px] flex-1 flex flex-col justify-end">
			{type === ETypeMessage.CHANNEL ? (
				<div className="h-[75px] w-[75px] rounded-full bg-bgLightModeButton dark:bg-zinc-700 flex items-center justify-center pl-2">
					<Hashtag defaultFill="#ffffff" defaultSize="w-10 h-10 mb-2" />
				</div>
			) : type === ETypeMessage.THREAD ? (
				<div className="h-[75px] w-[75px] rounded-full bg-bgLightModeButton dark:bg-zinc-700 flex items-center justify-center pl-2">
					<ThreadIcon defaultFill="#ffffff" defaultSize="w-10 h-10 mb-2" />
				</div>
			) : avatarDM ? (
				<img className="h-[75px] w-[75px] rounded-full flex items-center justify-center object-cover" alt="" src={avatarDM} />
			) : (
				<div className="h-[75px] w-[75px] bg-bgDisable rounded-full flex justify-center items-center text-contentSecondary text-4xl">
					{(userName ?? name)?.charAt(0).toUpperCase()}
				</div>
			)}

			<div>
				<p className="text-xl md:text-3xl font-bold pt-1 dark:text-white text-black" style={{ wordBreak: 'break-word' }}>
					Welcome to #{name}
				</p>
			</div>
			<div>
				{currentChannel?.parrent_id !== '0' && !avatarDM ? (
					<div className="mb-1 dark:text-textDarkTheme text-textLightTheme">
						<span className="text-base">Started by &nbsp;</span>
						<span className="text-base font-semibold">{user?.user?.username}</span>
					</div>
				) : (
					<p className="dark:text-zinc-400 text-colorTextLightMode text-sm">
						{avatarDM
							? type === 'DM'
								? `This is the beginning of your direct message history with ${name}`
								: `Welcome to the beginning of the #${name} group`
							: `This is the start of the #${name} ${currentChannel?.channel_private ? 'private' : ''} channel`}
					</p>
				)}
			</div>
		</div>
	);
}

export default ChatWelCome;
