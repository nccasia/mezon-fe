import { OfflineStatus, OnlineStatus } from "../Icons";

export type MemberProfileProps = {
	avatar: string;
	name: string;
	status?: boolean;
	isHideStatus?: boolean;
	isHideIconStatus?: boolean;
	numberCharacterCollapse?: number;
	textColor?: string;
	isHideUserName?: boolean
};

function MemberProfile({
	avatar,
	name,
	status,
	isHideStatus,
	isHideIconStatus,
	numberCharacterCollapse = 6,
	textColor = 'contentSecondary',
	isHideUserName
}: MemberProfileProps) {
	return (
		<div className="relative gap-[5px] flex items-center cursor-pointer">
			<a className="mr-[2px] relative inline-flex items-center justify-start w-10 h-10 text-lg text-white rounded-full">
				{avatar ? (
					<div>
						{!avatar.includes(',') ? (
							<img
								src={avatar}
								style={{
									width: '38px',
									height: '38px',
									borderRadius: '50%',
								}}
							/>
						) : (
							<img
								src={`/assets/images/avatar-group.png`}
								style={{
									width: '38px',
									height: '38px',
									borderRadius: '50%',
								}}
							/>
						)}
					</div>
				) : (
					<img
						src={`/assets/images/avatar-group.png`}
						style={{
							width: '38px',
							height: '38px',
							borderRadius: '50%',
						}}
					/> 
						
				)}
				{!isHideIconStatus && avatar ? (
					<span
						className={`absolute bottom-[-1px] right-[-1px] inline-flex items-center justify-center gap-1 p-[3px] text-sm text-white bg-[#111] rounded-full`}
					>
						{status ? <OnlineStatus /> : <OfflineStatus />}
					</span>
				) : (
					<></>
				)}
			</a>
			<div className="flex flex-col items-start">
				{!isHideUserName && (<p className="text-[15px]" title={name && name.length > numberCharacterCollapse ? name : undefined}>
					{name && name.length > numberCharacterCollapse ? `${name.substring(0, numberCharacterCollapse)}...` : name}
				</p>)}
				{!isHideStatus && <span className={`text-[11px] text-${textColor}`}>{!status ? 'Offline' : 'Online'}</span>}
			</div>
		</div>
	);
}

export default MemberProfile;
