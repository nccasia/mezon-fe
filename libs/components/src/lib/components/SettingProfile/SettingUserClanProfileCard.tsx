import { useAuth } from '@mezon/core';
export type Profilesform = {
	displayName: string;
	urlImage: string;
};
export type propProfilesform = {
	profiles: Profilesform;
};
const SettingUserClanProfileCard = (props: propProfilesform) => {
	const { userProfile } = useAuth();
	const { profiles } = props;

	return (
		<div className="bg-black mt-[10px]  rounded-lg flex flex-col relative">
			<div className="h-20 bg-[#8CBC4F] rounded-tr-[10px] rounded-tl-[10px]"></div>
			<div className="text-black ml-[50px]">
				{profiles.urlImage === undefined || profiles.urlImage === '' ? (
					<div className="w-[90px] h-[90px] bg-bgDisable rounded-full flex justify-center items-center text-contentSecondary text-[50px] mt-[-50px] ml-[-25px]">
						{userProfile?.user?.username?.charAt(0).toUpperCase()}
					</div>
				) : (
					<img
						src={profiles.urlImage}
						alt=""
						className="w-[90px] h-[90px] xl:w-[100px] xl:h-[100px] rounded-[50px] bg-bgSecondary mt-[-50px] ml-[-25px] border-[6px] border-solid border-black object-cover"
					/>
				)}
			</div>
			<div className="px-[16px]">
				<div className="bg-bgSecondary w-full p-4 my-[16px] rounded-[10px] flex flex-col gap-y-6 xl:gap-y-7">
					<div className="w-[300px]">
						<p className="font-bold tracking-wider text-xl">{profiles.displayName}</p>
						<p className="font-medium tracking-wide text-sm">{userProfile?.user?.username}</p>
					</div>
					<div className="w-full">
						<p className="tracking-wider text-sm font-bold">CUSTOMIZING MY PROFILE</p>
						<div className="flex  items-center gap-x-4 mt-2">
							<img
								src="https://i.postimg.cc/3RSsTnbD/3d63f5caeb33449b32d885e5aa94bbbf.jpg"
								alt=""
								className="w-[100px] h-[100px] rounded-[8px]"
							/>
							<div className="">
								<p className="text-base font-medium tracking-wide">User Profile</p>
								<p className="text-base font-medium">00: 38</p>
							</div>
						</div>
					</div>
					<div className="w-full items-center">
						<button className="w-full h-[50px] bg-[#1E1E1E] rounded-lg font-medium tracking-wide transition-all duration-300 hover:bg-bgButtonHover">
							Example button
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
export default SettingUserClanProfileCard;
