import { useAuth } from '@mezon/core';

const TestThemeBlock = () => {
	const { userProfile } = useAuth();
	const date = new Date();
	const realTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
	return (
		<div>
			<div className="font-semibold text-[24px] mb-6">Appearance</div>
			<div className="test-container bg-bgSecondary border border-solid border-gray-900 pb-5 overflow-y-hidden h-[150px]">
				<div className="test-item flex px-5 mt-[-15px]">
					<div className="test-left">
						<img className="aspect-square w-[45px] rounded-full" src={userProfile?.user?.avatar_url} alt="" />
					</div>
					<div className="test-right ml-3">
						<div className="test-right-top flex gap-3 items-center">
							<div className="test-right-top-username">{userProfile?.user?.display_name}</div>
							<div className="test-right-top-time text-[12px] text-stone-400">Today at {realTime}</div>
						</div>
						<div className="test-right-comment">Look at me I'm a beautiful butterfly</div>
					</div>
				</div>
				<div className="test-item flex px-5 mt-5">
					<div className="test-left">
						<img className="aspect-square w-[45px] rounded-full" src={userProfile?.user?.avatar_url} alt="" />
					</div>
					<div className="test-right ml-3 ">
						<div className="test-right-top flex gap-3 items-center">
							<div className="test-right-top-username">{userProfile?.user?.display_name}</div>
							<div className="test-right-top-time text-[12px] text-stone-400">Today at {realTime}</div>
						</div>
						<div className="test-right-comment">Look at me I'm a beautiful butterfly</div>
					</div>
				</div>
				<div className="test-item flex px-5 mt-5">
					<div className="test-left">
						<img className="aspect-square w-[45px] rounded-full" src={userProfile?.user?.avatar_url} alt="" />
					</div>
					<div className="test-right ml-3">
						<div className="test-right-top flex gap-3 items-center">
							<div className="test-right-top-username">{userProfile?.user?.display_name}</div>
							<div className="test-right-top-time text-[12px] text-stone-400">Today at {realTime}</div>
						</div>
						<div className="test-right-comment">Look at me I'm a beautiful butterfly</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TestThemeBlock;
