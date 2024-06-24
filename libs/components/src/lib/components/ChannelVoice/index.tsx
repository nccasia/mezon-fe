import { useAuth } from '@mezon/core';
import { selectFriendVoiceChannel, selectNumberMemberVoiceChannel, selectShowScreen } from '@mezon/store';
import { IChannelMember } from '@mezon/utils';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AddVoiceFriend from './ChannelVoiceOff/AddVoiceFriend';
import ChannelMemberAvatar from './ChannelVoiceOff/ChannelMemberAvatar';

export type ChannelVoiceProps = {
	channelId: string;
};

function ChannelVoice({ channelId }: ChannelVoiceProps) {
	const { userProfile } = useAuth();
	const showScreen = useSelector(selectShowScreen);
	const [isSelectScreen, setIsSelectScreen] = useState(false);
	const [classIdMeet, setClassIdMeet] = useState('');
	const numberMember = useSelector(selectNumberMemberVoiceChannel(channelId));
	const friendVoiceChannel = useSelector(selectFriendVoiceChannel(channelId, userProfile?.user?.id ?? ''));

	const handleClick = (event: any) => {
		const oldElementSelect = document.querySelector('.showScreen');
		if (oldElementSelect) {
			oldElementSelect.classList.remove('showScreen');
		}

		const btnAddFriend = document.querySelector('.btnAddFriend');
		const selectedElement = event.target;
		const wrapperBtnAddFriend = document.querySelector('.wrapperBtnAddFriend');
		if (btnAddFriend === selectedElement || selectedElement === wrapperBtnAddFriend) {
			setIsSelectScreen(false);
			return;
		} else {
			setIsSelectScreen(true);
		}
		selectedElement.classList.add('showScreen');
	};

	const handleCloseScreen = () => {
		setIsSelectScreen(false);
		const elementSelect = document.querySelector('.showScreen');
		if (elementSelect) {
			elementSelect.classList.remove('showScreen');
		}
	};

	useEffect(() => {
		if (numberMember < 4) {
			setClassIdMeet(`grid-cols-${numberMember + 0}`);
		} else {
			setClassIdMeet('grid-cols-3');
		}
	}, [showScreen, numberMember]);

	return (
		<div className="relative flex items-center h-full justify-center">
			<button
				className={`absolute top-0 right-5 bg-[#AEAEAE] w-[30px] h-[30px] rounded-[50px] font-bold transform hover:scale-105 hover:bg-slate-400 transition duration-300 ease-in-out ${isSelectScreen ? 'block' : 'hidden'}`}
				onClick={handleCloseScreen}
			>
				x
			</button>
			<div
				id="meet"
				className={`grid items-stretch gap-[10px] p-[10px] ${classIdMeet} w-full min-h-[50%] max-h-full ${isSelectScreen ? 'h-full' : 'h-fit'}`}
				onClick={handleClick}
				style={{
					gridTemplateColumns: numberMember < 2 ? 'repeat(2, minmax(0, 1fr))' : '',
					gridAutoRows: isSelectScreen ? '' : 'minmax(0, 1fr)',
					gridTemplateRows: isSelectScreen ? '3fr 1fr' : '',
				}}
				role="button"
			>
				<div className={`contents ${showScreen ? 'block' : 'hidden'}`}>
					<canvas id="canvas" className={`w-full bg-black rounded-[10px] h-full`}></canvas>
				</div>
				<div className={`localTrack contents`}>
					<ChannelMemberAvatar userId={userProfile?.user?.id ?? ''} />
					{numberMember < 2 && <AddVoiceFriend channelId={channelId} />}
				</div>
				<div className={`remoteTrack contents`}>
					{friendVoiceChannel.map((user: IChannelMember) => {
						return <ChannelMemberAvatar key={user.id} userId={user.user_id ?? ''} />;
					})}
				</div>
				<video id="screenvideo" autoPlay width={460} height={640} />
			</div>
		</div>
	);
}

export default ChannelVoice;
