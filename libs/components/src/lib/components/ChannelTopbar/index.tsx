import { appActions, selectIsShowMemberList } from '@mezon/store';
import { IChannel } from '@mezon/utils';
import { useDispatch, useSelector } from 'react-redux';
import * as Icons from '../Icons';
import { ChannelLable, SearchMessage } from './TopBarComponents';
import NotificationList from '../NotificationList';
export type ChannelTopbarProps = {
	channel?: IChannel | null;
};

function ChannelTopbar({ channel }: ChannelTopbarProps) {
	return (
		<div className="flex p-3 min-w-0 items-center bg-bgSecondary border-b border-black flex-shrink h-heightHeader">
			<div className="justify-start items-center gap-1 flex">
				<ChannelLable type={Number(channel?.type)} name={channel?.channel_lable} isPrivate={channel?.channel_private} />
			</div>

			{/* Desktop buttons */}
			<div className=" items-center h-full ml-auto flex">
				<div className="justify-end items-center gap-2 flex">
					<div className="justify-start items-center gap-[15px] flex">
						<ThreadButton />
						<MuteButton />
						<PinButton />
						<ChannelListButton />
						<ThreeDotButton />
					</div>
					<SearchMessage />
					<div className="justify-start items-start gap-4 flex">
						<NotificationList />
						<HelpButton />
					</div>
				</div>
			</div>
		</div>
	);
}

function ThreadButton() {
	return (
		<button>
			<Icons.ThreadIcon />
		</button>
	);
}

function MuteButton() {
	return (
		<button>
			<Icons.MuteBell />
		</button>
	);
}

function PinButton() {
	return (
		<button>
			<Icons.PinRight />
		</button>
	);
}

function ThreeDotButton() {
	return (
		<button>
			<Icons.ThreeDot />
		</button>
	);
}

function InboxButton() {
	return (
		<button>
			<Icons.Inbox />
		</button>
	);
}

function HelpButton() {
	return (
		<button>
			<Icons.Help />
		</button>
	);
}

function ChannelListButton() {
	const dispatch = useDispatch();
	const isActive = useSelector(selectIsShowMemberList);
	const handleClick = () => {
		dispatch(appActions.setIsShowMemberList(!isActive));
	};
	return (
		<button onClick={handleClick}>
			<Icons.MemberList isWhite={isActive} />
		</button>
	);
}

export default ChannelTopbar;
