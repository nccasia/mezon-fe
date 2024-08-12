import { useAuth, useChannelMembersActions } from '@mezon/core';
import { selectCurrentClan, selectCurrentVoiceChannelId } from '@mezon/store';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

interface ILeaveClanPopupProps {
	toggleShowPopup: () => void;
}

const LeaveClanPopup = ({ toggleShowPopup }: ILeaveClanPopupProps) => {
	const { removeMemberClan } = useChannelMembersActions();
	const { userProfile } = useAuth();
	const currentChannelId = useSelector(selectCurrentVoiceChannelId);
	const currentClan = useSelector(selectCurrentClan);
	const navigate = useNavigate();
	const handleLeaveClan = async () => {
		await removeMemberClan({ channelId: currentChannelId, clanId: currentClan?.clan_id as string, userIds: [userProfile?.user?.id as string] });
		toggleShowPopup();
		navigate("/mezon");
	};
	return (
		<div className="fixed inset-0 flex items-center justify-center z-50">
			<div className="fixed inset-0 bg-black opacity-80" />
			<div className="relative z-10 w-[440px]">
				<div className="dark:bg-[#313338] bg-white pt-[16px] px-[16px]">
					<div className="dark:text-textDarkTheme text-textLightTheme text-[20px] font-semibold pb-[16px]">
						Leave {currentClan?.clan_name}
					</div>
					<div className="dark:text-[#dbdee1] text-textLightTheme pb-[20px]">
						Are you sure you want to leave <b className="font-semibold">{currentClan?.clan_name}</b> ? You won’t be able to re-join this
						server unless you are re-invited.
					</div>
				</div>
				<div className="dark:bg-[#2b2d31] bg-[#f2f3f5] dark:text-textDarkTheme text-textLightTheme flex justify-end items-center gap-4 p-[16px] text-[14px] font-medium">
					<div onClick={toggleShowPopup} className="hover:underline cursor-pointer">
						Cancel
					</div>
					<div className="bg-red-600 hover:bg-red-700 text-white rounded-sm px-[25px] py-[8px] cursor-pointer" onClick={handleLeaveClan}>
						Leave clan
					</div>
				</div>
			</div>
		</div>
	);
};

export default LeaveClanPopup;
