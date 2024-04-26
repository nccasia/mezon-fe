import { ChannelMembersEntity } from '@mezon/utils';

type AvatarProps = {
	userById: ChannelMembersEntity | null;
};

const AvatarProfile = ({ userById }: AvatarProps) => {
	return (
		<div className="text-black ml-[50px]">
			{userById?.user?.avatar_url === undefined || userById?.user?.avatar_url === '' ? (
				<div className="w-[90px] h-[90px] bg-bgDisable rounded-full flex justify-center items-center text-contentSecondary text-[50px] mt-[-50px] ml-[-25px]">
					{userById?.user?.username?.charAt(0).toUpperCase()}
				</div>
			) : (
				<img
					src={userById?.user?.avatar_url}
					alt=""
					className="w-[90px] h-[90px] xl:w-[100px] xl:h-[100px] rounded-[50px] bg-bgSecondary mt-[-50px] ml-[-25px] border-[6px] border-solid border-black object-cover"
				/>
			)}
		</div>
	);
};

export default AvatarProfile;
