import { useMemberStatus } from '@mezon/core';
import { ChannelMembersEntity, IUserAccount, MemberProfileType } from '@mezon/utils';
import React, { useMemo } from 'react';
import { AvatarImage } from '../AvatarImage/AvatarImage';
import StatusUser from '../StatusUser';

type AvatarProfileProps = {
	avatar?: string;
	username?: string;
	userToDisplay: IUserAccount | ChannelMembersEntity | null | boolean | undefined;
	customStatus?: string;
	isAnonymous?: boolean;
	styleAvatar?: string;
	positionType?: string;
	userID?: string;
};

const AvatarProfile = ({ customStatus, avatar, username, isAnonymous, styleAvatar, userID, positionType }: AvatarProfileProps) => {
	const userStatus = useMemberStatus(userID || '');
	const isMemberDMGroup = useMemo(() => positionType === MemberProfileType.DM_MEMBER_GROUP, [positionType]);

	const isMemberChannel = useMemo(() => positionType === MemberProfileType.MEMBER_LIST, [positionType]);

	const isListDm = useMemo(() => positionType === MemberProfileType.DM_LIST, [positionType]);

	return (
		<div className=" text-black flex flex-1 flex-row gap-[6px] mt-[-50px] px-[16px]">
			<div className="relative h-fit">
				<AvatarImage
					alt={username || ''}
					userName={username}
					className={`w-[90px] h-[90px] min-w-[90px] min-h-[90px] xl:w-[90px] xl:h-[90px] rounded-[50px] border-[6px] border-solid dark:border-bgSecondary600 border-white object-cover my-0 ${styleAvatar}`}
					src={avatar}
					isAnonymous={isAnonymous}
					classNameText="!text-5xl"
				/>
				<div className="absolute bottom-2 right-4">
					<StatusUser
						isListDm={isListDm}
						isMemberChannel={isMemberChannel}
						isMemberDMGroup={isMemberDMGroup}
						status={userStatus}
						userId={userID}
						isTyping={false}
						sizeStatusIcon={'w-4 h-4'}
					/>
				</div>
			</div>

			{customStatus && (
				<div className="flex flex-col gap-[12px] mt-[30px] relative w-full h-[85px]">
					<div className="dark:bg-bgPrimary bg-white w-[12px] h-[12px] rounded-full shadow-md"></div>
					<div className="relative flex-1">
						<div className="dark:bg-bgPrimary bg-white w-[20px] h-[20px] rounded-full absolute top-[-11px] left-[16px] shadow-md"></div>
						<div className="absolute dark:bg-bgPrimary bg-white px-[16px] py-[12px] flex items-center justify-center rounded-[12px] w-fit max-w-full shadow-lg">
							<span className="text-left font-medium text-[14px] dark:text-white text-black w-full break-all overflow-hidden transition-all duration-300 hover:line-clamp-none line-clamp-2">
								{customStatus}
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default React.memo(AvatarProfile);
