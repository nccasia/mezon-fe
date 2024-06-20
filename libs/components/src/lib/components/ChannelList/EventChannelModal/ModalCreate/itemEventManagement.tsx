import { useEventManagement, useOnClickOutside } from '@mezon/core';
import { EventManagementEntity, selectChannelById, selectChannelFirst, selectMemberByUserId, selectTheme } from '@mezon/store';
import { OptionEvent } from '@mezon/utils';
import { Tooltip } from 'flowbite-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Coords } from '../../../ChannelLink';
import * as Icons from '../../../Icons';
import { compareDate, differenceTime, timeFomat } from '../timeFomatEvent';
import PanelEventItem from './panelEventItem';

export type ItemEventManagementProps = {
	option: string;
	topic: string;
	voiceChannel: string;
	titleEvent: string;
	address?: string;
	logo?: string;
	logoRight?: string;
	start: string;
	end?: string;
	event?: EventManagementEntity;
	createTime?: string;
	checkUserCreate?: boolean;
	setOpenModalDetail?: (status: boolean) => void;
};

const ItemEventManagement = (props: ItemEventManagementProps) => {
	const { topic, voiceChannel, titleEvent, option, address, logo, logoRight, start, end, event, createTime, checkUserCreate, setOpenModalDetail } =
		props;
	const { setChooseEvent, deleteEventManagement } = useEventManagement();
	const channelFirst = useSelector(selectChannelFirst);
	const channelVoice = useSelector(selectChannelById(voiceChannel));
	const userCreate = useSelector(selectMemberByUserId(event?.creator_id || ''));
	const checkOptionVoice = useMemo(() => option === OptionEvent.OPTION_SPEAKER, [option]);
	const checkOptionLocation = useMemo(() => option === OptionEvent.OPTION_LOCATION, [option]);

	const appearanceTheme = useSelector(selectTheme);

	const [openPanel, setOpenPanel] = useState(false);
	const [coords, setCoords] = useState<Coords>({
		mouseX: 0,
		mouseY: 0,
		distanceToBottom: 0,
	});

	const isSameDay = useMemo(() => {
		return compareDate(new Date(), createTime || '');
	}, [createTime]);

	const time = useMemo(() => timeFomat(start), [start]);

	const handleStopPropagation = (e: any) => {
		e.stopPropagation();
	};

	const handleOpenPanel = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const mouseX = event.clientX;
		const mouseY = event.clientY + window.screenY;
		const windowHeight = window.innerHeight;
		const distanceToBottom = windowHeight - event.clientY;
		setCoords({ mouseX, mouseY, distanceToBottom });
		setOpenPanel(true);
	};

	const panelRef = useRef(null);
	useOnClickOutside(panelRef, () => setOpenPanel(false));

	const checkTimeVoice = differenceTime(end || '') + 30 < 0;
	const checkTimeLocation = differenceTime(end || '') < 0;
	useEffect(() => {
		if (checkTimeVoice && checkOptionVoice) {
			deleteEventManagement(event?.clan_id || '', event?.id || '');
		}
		if (checkTimeLocation && checkOptionLocation) {
			deleteEventManagement(event?.clan_id || '', event?.id || '');
		}
	}, []);

	return (
		<div
			className="dark:bg-[#212529] bg-bgModifierHoverLight rounded-lg overflow-hidden"
			onClick={
				setOpenModalDetail && event
					? () => {
							setOpenModalDetail(true);
							setChooseEvent(event);
						}
					: // eslint-disable-next-line @typescript-eslint/no-empty-function
						() => {}
			}
			ref={panelRef}
		>
			{logo && <img src={logo} alt="logo" className="w-full max-h-[180px] object-cover" />}
			<div className="p-4 border-b dark:border-slate-600 border-white">
				<div className="flex justify-between">
					<div className="flex items-center gap-x-2 mb-4">
						{createTime && isSameDay && (
							<div className="text-[#7289da] rounded-full px-2 dark:bg-bgLightModeSecond bg-bgLightModeButton font-semibold">New</div>
						)}
						<Icons.IconEvents />
						<p className="font-semibold dark:text-zinc-400 text-colorTextLightMode">{time}</p>
					</div>
					{event?.creator_id && (
						<Tooltip
							content={`Created by ${userCreate?.user?.username}`}
							trigger="hover"
							animation="duration-500"
							style={appearanceTheme === 'light' ? 'light' : 'dark'}
						>
							<img src={userCreate?.user?.avatar_url} alt={userCreate?.user?.avatar_url} className="size-6 rounded-full" />
						</Tooltip>
					)}
				</div>
				<div className="flex justify-between">
					<p className="hover:underline font-bold dark:text-white text-black flex-grow basis-3/5 text-base">{topic}</p>
					{logoRight && <img src={logoRight} alt="logoRight" className="w-[60%] max-h-[100px] object-cover rounded flex-grow basis-2/5" />}
				</div>
			</div>
			<div className="px-4 py-3 flex items-center gap-x-2 justify-between">
				<div className="flex gap-x-2">
					{checkOptionVoice && (
						<>
							<Icons.Speaker />
							<p>{channelVoice?.channel_label}</p>
						</>
					)}
					{checkOptionLocation && (
						<>
							<Icons.Location />
							<p>{titleEvent}</p>
						</>
					)}
					{option === '' && !address && !channelVoice && (
						<>
							<Icons.Location />
							<p className="hover:underline text-slate-400">{channelFirst.channel_label}</p>
						</>
					)}
				</div>
				{event && (
					<div
						className="flex gap-x-2 items-center"
						onClick={(e) => {
							handleStopPropagation(e);
						}}
					>
						<div onClick={(e) => handleOpenPanel(e)}>
							<Icons.IconEditThreeDot className="dark:text-[#AEAEAE] text-[#535353] dark:hover:text-white hover:text-black rotate-90" />
						</div>

						<button className="flex gap-x-1 rounded px-4 py-2 dark:bg-zinc-600 bg-[#6d6f78] hover:bg-opacity-80 font-medium text-white">
							{checkOptionVoice && <Icons.IconShareEventVoice />}
							{checkOptionLocation && <Icons.IConShareEventLocation />}
							Share
						</button>
						<button className="flex gap-x-1 rounded px-4 py-2 dark:bg-zinc-600 bg-[#6d6f78] hover:bg-opacity-80 font-medium text-white">
							<Icons.MuteBell defaultSize="size-4 text-white" />
							Interested
						</button>
					</div>
				)}
			</div>
			{openPanel && (
				<PanelEventItem
					coords={coords}
					onHandle={handleStopPropagation}
					checkUserCreate={checkUserCreate || true}
					event={event}
					onClose={() => setOpenPanel(false)}
				/>
			)}
		</div>
	);
};

export default ItemEventManagement;
