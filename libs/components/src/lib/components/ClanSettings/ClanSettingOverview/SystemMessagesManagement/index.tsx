import {
	ChannelsEntity,
	fetchSystemMessageByClanId,
	selectAllChannels,
	selectCurrentClanId,
	updateSystemMessage,
	useAppDispatch,
	useAppSelector
} from '@mezon/store';
import { Icons } from '@mezon/ui';
import { unwrapResult } from '@reduxjs/toolkit';
import { Dropdown } from 'flowbite-react';
import { ChannelType } from 'mezon-js';
import { ApiSystemMessage } from 'mezon-js/api.gen';
import React, { useEffect, useState } from 'react';

const SystemMessagesManagement = () => {
	const channelsList = useAppSelector(selectAllChannels);
	const currentClanId = useAppSelector(selectCurrentClanId);

	const [systemMessage, setSystemMessage] = useState<ApiSystemMessage | null>(null);
	const [selectedChannel, setSelectedChannel] = useState<ChannelsEntity | null>(null);

	const dispatch = useAppDispatch();

	useEffect(() => {
		if (currentClanId) {
			const fetchMessage = async () => {
				try {
					const resultAction = await dispatch(fetchSystemMessageByClanId(currentClanId));
					const message = unwrapResult(resultAction);
					setSystemMessage(message);
				} catch (err) {
					console.error('Failed to fetch system message:', err);
				}
			};

			fetchMessage();
		}
	}, [currentClanId, dispatch]);

	useEffect(() => {
		if (systemMessage && channelsList.length > 0) {
			const channelsListWithoutVoiceChannel = channelsList.filter(
				(channel) => channel.clan_id === currentClanId && channel.type !== ChannelType.CHANNEL_TYPE_VOICE && channel.parrent_id === '0'
			);

			const systemMessageChannel = channelsListWithoutVoiceChannel.find((channel) => channel.channel_id === systemMessage.channel_id);
			setSelectedChannel(systemMessageChannel || channelsListWithoutVoiceChannel[0]);
		}
	}, [systemMessage, channelsList, currentClanId]);

	const handleSelectChannel = (channel: ChannelsEntity) => {
		setSelectedChannel(channel);
		if (currentClanId) {
			const request = {
				clanId: currentClanId,
				channelId: {
					channel_id: channel.channel_id
				}
			};

			dispatch(updateSystemMessage(request));
		}
	};

	return (
		<div
			className={
				'border-t dark:border-borderDivider border-borderDividerLight mt-10 pt-10 flex flex-col dark:text-textSecondary text-textSecondary800'
			}
		>
			<h3 className="text-sm font-bold uppercase mb-2">System Messages Channel</h3>
			<Dropdown
				placement={'bottom-start'}
				label={''}
				renderTrigger={() => (
					<div className="w-full h-10 rounded-md flex flex-row p-3 justify-between items-center uppercase text-xs dark:bg-bgInputDark bg-bgLightModeThird border dark:text-textPrimary text-textPrimaryLight">
						<div className={'dark:text-textPrimary text-textPrimary400 flex flex-row items-center'}>
							<p># {selectedChannel?.channel_label}</p>
							<p className={'uppercase dark:text-textThreadPrimary ml-5'}>{selectedChannel?.category_name}</p>
						</div>
						<div>
							<Icons.ArrowDownFill />
						</div>
					</div>
				)}
				className={'h-fit max-h-[200px] text-xs overflow-y-scroll customSmallScrollLightMode dark:bg-bgTertiary px-2'}
			>
				{channelsList
					.filter(
						(channel) =>
							channel.clan_id === currentClanId && channel.type !== ChannelType.CHANNEL_TYPE_VOICE && channel.parrent_id === '0'
					)
					.map((channel) =>
						channel.channel_id !== selectedChannel?.channel_id ? (
							<div
								key={channel.id}
								className="flex flex-row items-center dark:text-textPrimary text-textPrimaryLight rounded-sm dark:hover:bg-bgModifierHover hover:bg-bgIconDark text-sm w-full py-1 px-4 text-left cursor-pointer"
								onClick={() => handleSelectChannel(channel)}
							>
								<p># {channel.channel_label ?? ''}</p>
								<p className="uppercase dark:text-textSecondary text-textSecondary800 ml-5">{channel.category_name}</p>
							</div>
						) : null
					)}
			</Dropdown>
			<p className={'text-xs dark:text-textPrimary text-textPrimaryLight py-2'}>
				This is the channel we send system event messages to. These can be turned off at any time
			</p>
			<ToggleItem label={'Send a random welcome message when someone joins this server.'} value={true} />
			<ToggleItem label={'Prompt members to reply to welcome messages with a sticker.'} value={true} />
			<ToggleItem label={'Send a message when someone Boosts this server.'} value={true} />
			<ToggleItem label={'Send helpful tips for server setup.'} value={true} />
		</div>
	);
};

export default SystemMessagesManagement;

type ToggleItemProps = {
	label: string;
	value: boolean;
	handleToggle?: () => void;
};

const ToggleItem: React.FC<ToggleItemProps> = ({ label, value, handleToggle }) => {
	return (
		<div className="Frame347 self-stretch justify-start items-center gap-3 inline-flex text-sm py-1">
			<div className="Frame409 grow shrink basis-0 h-6 justify-start items-center gap-1 flex">
				<p>{label}</p>
			</div>
			<div className="relative flex flex-wrap items-center">
				<input
					className="peer relative h-4 w-8 cursor-pointer appearance-none rounded-lg
               bg-slate-300 transition-colors after:absolute after:top-0 after:left-0 after:h-4 after:w-4 after:rounded-full
                after:bg-slate-500 after:transition-all checked:bg-blue-200 checked:after:left-4 checked:after:bg-blue-500
                 hover:bg-slate-400 after:hover:bg-slate-600 checked:hover:bg-blue-300 checked:after:hover:bg-blue-600
                  focus:outline-none checked:focus:bg-blue-400 checked:after:focus:bg-blue-700 focus-visible:outline-none disabled:cursor-not-allowed
                   disabled:bg-slate-200 disabled:after:bg-slate-300"
					type="checkbox"
					value={1}
					id="id-c01"
					onChange={handleToggle}
				/>
			</div>
		</div>
	);
};
