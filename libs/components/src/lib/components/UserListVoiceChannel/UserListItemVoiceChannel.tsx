import { useMembersVoiceChannel } from '@mezon/core';
import { selectMemberByGoogleId } from '@mezon/store';
import { NameComponent } from '@mezon/ui';
import { IChannelMember } from '@mezon/utils';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AvatarImage, Icons } from '../../components';

function UserListItem({ user, channelID }: { user: IChannelMember; channelID: string }) {
	const member = useSelector(selectMemberByGoogleId(user.user_id ?? ''));
	const { setMembersVoiceChannel } = useMembersVoiceChannel();

	useEffect(() => {
		setMembersVoiceChannel(channelID, user.id);
	}, [setMembersVoiceChannel, channelID, user.id]);

	return (
		<div className="dark:hover:bg-[#36373D] hover:bg-bgLightModeButton w-[90%] flex p-1 ml-5 items-center gap-3 cursor-pointer rounded-sm">
			<div className="w-5 h-5 rounded-full scale-75">
				<div className="w-8 h-8 mt-[-0.3rem]">
					{member ? (
						<AvatarImage
							alt={member?.user?.username || ''}
							userName={member?.user?.username}
							className="min-w-8 min-h-8 max-w-8 max-h-8"
							src={member?.user?.avatar_url}
						/>
					) : (
						<Icons.AvatarUser />
					)}
				</div>
			</div>
			<div>
				{member ? (
					<NameComponent name={member?.user?.username || ''} />
				) : (
					<p className="text-sm font-medium dark:text-[#AEAEAE] text-colorTextLightMode">{user.participant} (guest)</p>
				)}
			</div>
		</div>
	);
}

export default UserListItem;
