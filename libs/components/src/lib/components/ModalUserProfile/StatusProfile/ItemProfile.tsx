type ItemProfileProps = {
	avatar?: string;
	username?: string;
};

const ItemProfile = ({ avatar, username }: ItemProfileProps) => {
	return (
		<div className="flex items-center justify-between gap-2 rounded-sm hover:bg-zinc-700 hover:[&>*]:text-[#fff] px-2">
			{avatar ? (
				<img src={avatar} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
			) : (
				<div className="w-[30px] h-[30px] bg-bgDisable rounded-full flex justify-center items-center text-contentSecondary text-[16px]">
					{username && username.charAt(0).toUpperCase()}
				</div>
			)}
			<li className="text-[14px] text-white w-full py-[6px] cursor-pointer list-none ">{username}</li>
		</div>
	);
};

export default ItemProfile;
