import { ChannelStatusEnum, IChannel } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { useState } from 'react';
import * as Icons from '../Icons';
import { DeleteModal } from './Component/Modal/deleteChannelModal';

export type ChannelSettingItemProps = {
	onItemClick: (settingName: string) => void;
	channel: IChannel;
	stateClose: boolean;
	stateMenu: boolean;
	onCloseModal: () => void;
};

const ChannelSettingItem = (props: ChannelSettingItemProps) => {
	const { onItemClick, onCloseModal, channel, stateMenu, stateClose } = props;
	const isPrivate = channel.channel_private;
	const [selectedButton, setSelectedButton] = useState<string | null>('Overview');
	const [showModal, setShowModal] = useState(false);

	const handleButtonClick = (buttonName: string) => {
		setSelectedButton(buttonName);
	};

	return (
		<div className={`overflow-y-auto w-1/6 xl:w-1/4 min-w-56 dark:bg-bgSecondary bg-white dark:text-white text-black flex justify-end pt-96 pr-2 scrollbar-thin scrollbar-thumb-black scrollbar-track-gray-200 2xl:flex-grow hide-scrollbar flex-grow  ${(stateClose && !stateMenu) ? 'hidden' : 'flex'}`}>
			<div className="w-170px">
				<div className="flex justify-start">
					{isPrivate === ChannelStatusEnum.isPrivate && channel.type === ChannelType.CHANNEL_TYPE_VOICE && (
						<Icons.SpeakerLocked defaultSize="w-5 h-5" />
					)}
					{isPrivate === ChannelStatusEnum.isPrivate && channel.type === ChannelType.CHANNEL_TYPE_TEXT && (
						<Icons.HashtagLocked defaultSize="w-5 h-5 -mt-1" />
					)}
					{isPrivate === undefined && channel.type === ChannelType.CHANNEL_TYPE_VOICE && <Icons.Speaker defaultSize="w-5 5-5" />}
					{isPrivate === undefined && channel.type === ChannelType.CHANNEL_TYPE_TEXT && <Icons.Hashtag defaultSize="w-5 h-5 -mt-1" />}
					<p className="text-[#84ADFF] font-bold text-sm tracking-wider max-w-[160px] overflow-x-hidden text-ellipsis uppercase one-line">
						{channel.channel_label}
					</p>
				</div>
				<button
					className={`dark:text-[#AEAEAE] text-black w-[170px] text-[16px] font-medium rounded-[5px] text-left ml-[-8px] p-2 mt-4 hover:bg-bgModalLight ${selectedButton === 'Overview' ? 'dark:bg-[#232E3B] bg-bgModifierHoverLight' : ''}`}
					onClick={() => {
						handleButtonClick('Overview');
						onItemClick && onItemClick('Overview');
					}}
				>
					Overview
				</button>
				<br />
				<button
					className={`p-2 dark:text-[#AEAEAE] text-black text-[16px] font-medium pl-2 ml-[-8px] hover:bg-bgModalLight ${selectedButton === 'Permissions' ? 'dark:bg-[#232E3B] bg-bgModifierHoverLight' : ''} mt-1 w-[170px] text-left rounded-[5px]`}
					onClick={() => {
						handleButtonClick('Permissions');
						onItemClick && onItemClick('Permissions');
					}}
				>
					Permissions
				</button>
				<br />
				<button
					className={`p-2 dark:text-[#AEAEAE] text-black text-[16px] font-medium pl-2 ml-[-8px] hover:bg-bgModalLight ${selectedButton === 'Invites' ? 'dark:bg-[#232E3B] bg-bgModifierHoverLight  ' : ''} mt-1 w-[170px] text-left rounded-[5px]`}
					onClick={() => {
						handleButtonClick('Invites');
						onItemClick && onItemClick('Invites');
					}}
				>
					Invites
				</button>
				<br />
				<button
					className={`p-2 dark:text-[#AEAEAE] text-black text-[16px] font-medium pl-2 ml-[-8px] hover:bg-bgModalLight ${selectedButton === 'Integrations' ? 'dark:bg-[#232E3B] bg-bgModifierHoverLight  ' : ''} mt-1 w-[170px] text-left rounded-[5px]`}
					onClick={() => {
						handleButtonClick('Integrations');
						onItemClick && onItemClick('Integrations');
					}}
				>
					Integrations
				</button>
				<hr className="border-t border-solid dark:border-borderDefault my-4" />
				<button
					className={`p-2 dark:text-[#AEAEAE] text-black text-[16px] font-medium pl-2 ml-[-8px] hover:bg-bgModalLight ${selectedButton === 'Delete' ? 'dark:bg-[#232E3B] bg-bgModifierHoverLight  ' : ''} w-[170px] text-left rounded-[5px]`}
					onClick={() => {
						handleButtonClick('Delete');
						setShowModal(true);
					}}
				>
					Delete Channel
				</button>
			</div>
			{showModal && (
				<DeleteModal
					onCloseModal = {onCloseModal}
					onClose={() => setShowModal(false)}
					channelLable={channel?.channel_label || ''}
					channelId={channel.channel_id as string}
				/>
			)}
		</div>
	);
};

export default ChannelSettingItem;
