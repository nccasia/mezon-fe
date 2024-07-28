import { selectAllClans, selectCurrentClan } from '@mezon/store';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import SettingRightClanEdit from './settingUserClanProfileEdit';
const SettingRightClan = ({ onUserProfileClick, menuIsOpen }: { onUserProfileClick?: () => void; menuIsOpen: boolean }) => {
	const clans = useSelector(selectAllClans);
	const currentClan = useSelector(selectCurrentClan);
	const [flagOption, setFlagOption] = useState<boolean>(false);
	const [selectedClanId, setSelectedClanId] = useState<string | undefined>(currentClan ? currentClan.id : undefined);
	const handleUserProfileButtonClick = () => {
		if (onUserProfileClick) {
			onUserProfileClick();
		}
	};
	const handleClanChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedClanId(event.target.value);
	};

	return (
		<div
			className={`overflow-y-auto flex flex-col flex-1 shrink dark:bg-bgPrimary bg-white w-1/2 pt-[94px] pb-7 sbm:pr-[10px] pr-[40px] pl-[40px] overflow-x-hidden ${menuIsOpen === true ? 'min-w-[700px]' : ''} 2xl:min-w-[900px] max-w-[740px] hide-scrollbar`}
		>
			<div className="dark:text-white text-black">
				<h1 className="text-xl font-semibold tracking-wider mb-8">Profiles</h1>
				<button className="pt-1 text-[#AEAEAE] font-bold text-base tracking-wider" onClick={handleUserProfileButtonClick}>
					User Profile
				</button>
				<button className="pt-1 font-bold text-base ml-[16px] border-b-2 border-[#155EEF] pb-2 tracking-wider">Clan Profiles</button>
				<div className="flex mt-[30px] flex-col xl:flex-row gap-x-1 text-sm font-normal">
					<p>Show who you are with different profiles for each of your clans</p>
					<a href=" " className="text-[#155EEF] text-sm font-normal">
						{' '}
						Learn more about Clan Profiles
					</a>
				</div>
				<p className="mt-[20px] font-bold text-sm dark:text-[#CCCCCC] text-black tracking-wide">CHOOSE A CLAN</p>
				<select
					name="clan"
					className="block w-full mt-1 dark:bg-black bg-[#f0f0f0] border dark:border-white border-slate-200 dark:text-white text-black rounded px-4 py-3 font-normal text-sm tracking-wide outline-none"
					disabled={flagOption}
					value={selectedClanId}
					onChange={handleClanChange}
				>
					{clans.map((clan) => (
						<option key={clan.id} value={clan.id} style={{ width: '200px' }} className="">
							{clan.clan_name}
						</option>
					))}
				</select>
			</div>
			<SettingRightClanEdit
				flagOption={flagOption}
				setFlagOption={setFlagOption}
				clanId={selectedClanId || ''}
			/>
		</div>
	);
};
export default SettingRightClan;
