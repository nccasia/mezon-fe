import { useOnClickOutside } from '@mezon/core';
import { channelsActions, DirectEntity, useAppDispatch } from '@mezon/store';
import { MouseButton } from '@mezon/utils';
import { ApiUpdateChannelDescRequest, ChannelType } from 'mezon-js';
import { useEffect, useRef, useState } from 'react';
import { Coords } from '../../ChannelLink';
import PanelMember from '../../PanelMember';

type LabelDmProps = {
	dmGroupId: string;
	currentDmGroup: DirectEntity;
};

const LabelDm = (props: LabelDmProps) => {
	const { dmGroupId, currentDmGroup } = props;
	const dispatch = useAppDispatch();
	const [label, setLabel] = useState(currentDmGroup?.channel_label ||'');
	const [openEditName, setOpenEditName] = useState(false);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const [isShowPanel, setIsShowPanel] = useState(false);
	const [coords, setCoords] = useState<Coords>({
		mouseX: 0,
		mouseY: 0,
		distanceToBottom: 0,
	});
	const handleMouseClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		// stop open popup default of web
		window.oncontextmenu = (e) => {
			e.preventDefault();
		};
		const mouseX = event.clientX;
		const mouseY = event.clientY;
		const windowHeight = window.innerHeight;

		const distanceToBottom = windowHeight - mouseY;

		if (event.button === MouseButton.RIGHT) {
			setCoords({ mouseX, mouseY, distanceToBottom });
			setIsShowPanel(true);
		}
	};

	const handleOpenEditName = () => {
		if (currentDmGroup?.type === ChannelType.CHANNEL_TYPE_GROUP) {
			setOpenEditName(true);
		}
	};

	const handleChange = (event: any) => {
		setLabel(event.target.value);
	};

	const handleKeyDown = (event: any) => {
		if (event.key === 'Enter') {
			setOpenEditName(false);
			handleSave();
		}
	};

	const handleSave = async () => {
		const updateChannel: ApiUpdateChannelDescRequest = {
			channel_id: dmGroupId || '',
			channel_label: label,
			category_id: '',
		};
		await dispatch(channelsActions.updateChannel(updateChannel));
	};

	const inputRef = useRef<HTMLInputElement | null>(null);
	useEffect(() => {
		if (openEditName && inputRef.current) {
			inputRef.current.focus();
		}
	}, [openEditName]);

	useEffect(() => {
		setOpenEditName(false);
		setLabel(currentDmGroup?.channel_label || '');
		setIsShowPanel(false);
	}, [currentDmGroup?.channel_label]);

	useOnClickOutside(panelRef, () => setIsShowPanel(false));

	return (
		<>
			{!openEditName ? (
				<h2
					ref={panelRef}
					onMouseDown={(event) => handleMouseClick(event)}
					className="shrink-1 dark:text-white text-black text-ellipsis"
					onClick={handleOpenEditName}
				>
					{label || `${currentDmGroup.creator_name}'s Group`}
				</h2>
			) : (
				<input
					ref={inputRef}
					defaultValue={label}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					className="w-full dark:text-white text-black outline-none border dark:border-white border-slate-200 bg-bgLightModeButton dark:bg-bgSecondary rounded"
				/>
			)}
			{isShowPanel && (
				<PanelMember
					name={currentDmGroup.channel_label}
					coords={coords}
					onClose={() => setIsShowPanel(false)}
					isMemberDMGroup={false}
					directMessageValue={{
						type: currentDmGroup?.type?.toString() || '',
						userId: currentDmGroup?.user_id || [],
						dmID: currentDmGroup?.channel_id || '',
					}}
				/>
			)}
		</>
	);
};

export default LabelDm;
