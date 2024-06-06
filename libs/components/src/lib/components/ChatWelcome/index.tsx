import { useThreads } from '@mezon/core';
import { selectMemberByUserId } from '@mezon/store';
import { ETypeMessage } from '@mezon/utils';
import { useSelector } from 'react-redux';
import { Hashtag, ThreadIcon } from '../Icons';

export type ChatWelComeProp = {
	readonly type: Readonly<string>;
	readonly name?: Readonly<string>;
	readonly avatarDM?: Readonly<string>;
};

function ChatWelCome({ type, name, avatarDM }: ChatWelComeProp) {
	const { threadCurrentChannel } = useThreads();
	const user = useSelector(selectMemberByUserId(threadCurrentChannel?.creator_id as string));
	return (
		<div className="space-y-2 px-4 mb-4 mt-[250px]">
			{type === ETypeMessage.CHANNEL ? (
				<div className="h-[75px] w-[75px] rounded-full bg-bgLightModeButton dark:bg-zinc-700 flex items-center justify-center pl-2">
					<Hashtag defaultFill="#ffffff" defaultSize="w-10 h-10 mb-2" />
				</div>
			) : type === ETypeMessage.THREAD ? (
				<div className="h-[75px] w-[75px] rounded-full bg-bgLightModeButton dark:bg-zinc-700 flex items-center justify-center pl-2">
					<ThreadIcon defaultFill="#ffffff" defaultSize="w-10 h-10 mb-2" />
				</div>
			) : (
				<img className="h-[75px] w-[75px] rounded-full flex items-center justify-center object-cover" alt="" src={avatarDM} />
			)}

			{type === ETypeMessage.THREAD && threadCurrentChannel && (
				<div>
					<h4 className="text-[32px] font-bold my-2 dark:text-textDarkTheme text-textLightTheme">{threadCurrentChannel?.channel_label}</h4>
					<div className="mb-1 dark:text-textDarkTheme text-textLightTheme">
						<span className="text-base">Started by &nbsp;</span>
						<span className="text-base font-semibold">{user?.user?.username}</span>
					</div>
				</div>
			)}

			{type !== ETypeMessage.THREAD && !threadCurrentChannel && (
				<div>
					<p className="text-xl md:text-3xl font-bold pt-1 dark:text-white text-black" style={{ wordBreak: 'break-word' }}>
						{type === 'CHANNEL' ? 'Welcome to #' : ''} {name}
					</p>

					<p className="dark:text-zinc-400 text-colorTextLightMode text-sm">
						{type === 'CHANNEL' ? `This is the start of the #${name} channel.` : `This is the start of your conversation with ${name}`}
					</p>
				</div>
			)}
		</div>
	);
}

export default ChatWelCome;
