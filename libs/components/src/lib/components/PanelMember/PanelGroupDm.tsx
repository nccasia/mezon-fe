import { useAppNavigation, useAppParams } from '@mezon/core';
import { deleteChannel, fetchDirectMessage, removeMemberChannel, selectCurrentUserId, useAppDispatch, useAppSelector } from '@mezon/store';
import { Dropdown } from 'flowbite-react';
import { useState } from 'react';
import ModalConfirm from '../ModalConfirm';
import ItemPanelMember from './ItemPanelMember';

interface PanelGroupDMPProps {
	isDmGroupOwner: boolean;
	dmGroupId?: string;
	lastOne: boolean;
}

const PanelGroupDM = ({ isDmGroupOwner, dmGroupId, lastOne }: PanelGroupDMPProps) => {
	const dispatch = useAppDispatch();
	const { directId } = useAppParams();
	const currentUserId = useAppSelector(selectCurrentUserId);
	const { navigate } = useAppNavigation();
	const [popupLeave, setPopupLeave] = useState<boolean>(false);
	const handleLeaveDmGroup = async () => {
		const isLeaveOrDeleteGroup = lastOne
			? await dispatch(deleteChannel({ clanId: '', channelId: dmGroupId ?? '', isDmGroup: true }))
			: await dispatch(removeMemberChannel({ channelId: dmGroupId || '', userIds: [currentUserId], kickMember: false }));
		if (!isLeaveOrDeleteGroup) {
			return;
		}
		if (directId === dmGroupId) {
			navigate('/chat/direct/friends');
		}
		await dispatch(fetchDirectMessage({ noCache: true }));
	};

	const handleConfirmLeave = (e: Event) => {
		if (lastOne) {
			e.stopPropagation();
			setPopupLeave(true);
			return;
		}
		handleLeaveDmGroup();
	};

	const handleCancelLeave = () => {
		setPopupLeave(false);
	};

	return (
		<>
			<div className="border-b dark:border-[#2e2f34]">
				<ItemPanelMember children="Mark as read" />
			</div>
			<div className="border-b dark:border-[#2e2f34]">
				{isDmGroupOwner && <ItemPanelMember children="Invites" />}
				<ItemPanelMember children="Change icon" />
			</div>
			<div className="border-b dark:border-[#2e2f34]">
				<Dropdown
					trigger="hover"
					dismissOnClick={false}
					renderTrigger={() => (
						<div>
							<ItemPanelMember children="Invite to Clan" dropdown />
						</div>
					)}
					label=""
					placement="left-start"
					className="dark:!bg-bgProfileBody !bg-bgLightPrimary !left-[-6px] border-none py-[6px] px-[8px] w-[200px]"
				>
					<ItemPanelMember children="For 15 Minutes" />
					<ItemPanelMember children="For 1 Hour" />
					<ItemPanelMember children="For 3 Hours" />
					<ItemPanelMember children="For 8 Hours" />
					<ItemPanelMember children="For 24 Hours" />
					<ItemPanelMember children="Until I turn it back on" />
				</Dropdown>
			</div>
			<ItemPanelMember children={lastOne ? 'Delete Group' : 'Leave Group'} danger onClick={handleConfirmLeave} />
			{popupLeave && lastOne && (
				<ModalConfirm
					handleCancel={handleCancelLeave}
					handleConfirm={handleLeaveDmGroup}
					title="delete"
					leaveName="this group"
					buttonName="Delete Group"
				/>
			)}
		</>
	);
};

export default PanelGroupDM;
