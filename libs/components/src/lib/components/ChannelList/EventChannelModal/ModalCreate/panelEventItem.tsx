import { useAuth, usePermissionChecker } from '@mezon/core';
import { EventManagementEntity, selectUserMaxPermissionLevel } from '@mezon/store';
import { EPermission } from '@mezon/utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Coords } from '../../../ChannelLink';
import ItemPanel from '../../../PanelChannel/ItemPanel';

type PanelEventItemProps = {
	coords: Coords;
	event?: EventManagementEntity;
	onHandle: (e: unknown) => void;
	setOpenModalDelEvent: React.Dispatch<React.SetStateAction<boolean>>;
	onClose: () => void;
};

function PanelEventItem(props: PanelEventItemProps) {
	const { coords, event, onHandle, setOpenModalDelEvent, onClose } = props;
	const { userProfile } = useAuth();
	const [isClanOwner] = usePermissionChecker([EPermission.clanOwner, EPermission.manageClan]);
	const userMaxPermissionLevel = useSelector(selectUserMaxPermissionLevel);

	const canModifyEvent = useMemo(() => {
		if (isClanOwner) {
			return true;
		}
		const isEventICreated = event?.creator_id === userProfile?.user?.id;
		if (isEventICreated) {
			return true;
		}

		return Number(userMaxPermissionLevel) > Number(event?.max_permission);
	}, [event?.creator_id, event?.max_permission, isClanOwner, userMaxPermissionLevel, userProfile?.user?.id]);

	const handleDeleteEvent = async () => {
		setOpenModalDelEvent(true);
		onClose();
	};

	return (
		<div
			className="fixed dark:bg-bgProfileBody bg-gray-100 rounded-sm shadow z-10 w-[200px] py-[10px] px-[10px]"
			style={{
				left: coords.mouseX + 10,
				top: coords.distanceToBottom > 140 ? coords.mouseY - 30 : '',
				bottom: coords.distanceToBottom < 140 ? '20px' : ''
			}}
			onClick={onHandle}
		>
			{canModifyEvent && (
				<>
					<ItemPanel children="Start Event" />
					<ItemPanel children="Edit Event" />
					<ItemPanel children="Cancel Event" danger={true} onClick={handleDeleteEvent} />
				</>
			)}
			<ItemPanel children="Copy Event Link" />
		</div>
	);
}

export default PanelEventItem;
