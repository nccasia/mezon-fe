import { useAuth } from '@mezon/core';
import { useEffect, useState } from 'react';
import { AvatarImage } from '../AvatarImage/AvatarImage';
import { getColorAverageFromURL } from '../SettingProfile/AverageColor';

type SettingAccountProps = {
	onSettingProfile: (value: string) => void;
	menuIsOpen: boolean;
};

const SettingAccount = ({ onSettingProfile, menuIsOpen }: SettingAccountProps) => {
	const { userProfile } = useAuth();
	const urlImg = userProfile?.user?.avatar_url;
	const checkUrl = urlImg === undefined || urlImg === '';

	const [color, setColor] = useState<string>('#323232');

	const handleClick = () => {
		onSettingProfile('Profiles');
	};

	useEffect(() => {
		const getColor = async () => {
			if (!checkUrl) {
				const colorImg = await getColorAverageFromURL(urlImg);
				if (colorImg) setColor(colorImg);
			}
		};

		getColor();
	}, [checkUrl, urlImg]);

	return (
		<div
			className={`"overflow-y-auto flex flex-col flex-1 shrink dark:bg-bgPrimary bg-white w-1/2 pt-[94px] pb-7 pr-[10px] sbm:pl-[40px] pl-[10px] overflow-x-hidden ${menuIsOpen === true ? 'min-w-[700px]' : ''} 2xl:min-w-[900px] max-w-[740px] hide-scrollbar dark:text-white text-colorTextLightMode text-sm"`}
		>
			<h1 className="text-xl font-semibold tracking-wider mb-8">My Account</h1>
			<div className="w-full rounded-lg overflow-hidden dark:bg-black bg-bgLightMode">
				<div className="h-[100px] bg-black" style={{ backgroundColor: color }}></div>
				<div className="flex justify-between relative -top-5 px-4 flex-col sbm:flex-row sbm:items-center">
					<div className="flex items-center gap-x-4">
						<AvatarImage
							alt={userProfile?.user?.username || ''}
							userName={userProfile?.user?.username}
							className="w-[90px] h-[90px] xl:w-[100px] xl:h-[100px] rounded-[50px] border-[6px] border-solid dark:border-bgSecondary600 border-white object-cover"
							src={urlImg}
							classNameText="!text-5xl"
						/>
						<div className="font-semibold text-lg">{userProfile?.user?.display_name}</div>
					</div>
					<div
						className="bg-primary h-fit px-4 py-2 rounded cursor-pointer hover:bg-opacity-80 text-white w-fit text-center"
						onClick={handleClick}
					>
						Edit User Profile
					</div>
				</div>
				<div className="rounded-md dark:bg-bgSecondary bg-bgLightModeSecond m-4 p-4">
					<div className="flex justify-between items-center mb-4">
						<div>
							<h4 className="uppercase font-bold text-xs dark:text-zinc-400 text-textLightTheme mb-1">Display Name</h4>
							<p>{userProfile?.user?.display_name || "You haven't added a display name yet."}</p>
						</div>
						<div className="bg-zinc-600 h-fit rounded px-4 py-2 cursor-pointer hover:bg-opacity-80 text-white" onClick={handleClick}>
							Edit
						</div>
					</div>
					<div className="flex justify-between items-center">
						<div>
							<h4 className="uppercase font-bold text-xs dark:text-zinc-400 text-textLightTheme mb-1">Username</h4>
							<p>{userProfile?.user?.username}</p>
						</div>
						<div className="bg-zinc-600 h-fit rounded px-4 py-2 cursor-pointer hover:bg-opacity-80 text-white" onClick={handleClick}>
							Edit
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SettingAccount;
