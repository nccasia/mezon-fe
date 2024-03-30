import { selectVoiceChannelMembersByChannelId } from '@mezon/store';
import { AvatarComponent, NameComponent } from '@mezon/ui';
import { IChannelMember } from '@mezon/utils';
import { Fragment } from 'react';
import { useSelector } from 'react-redux';

export type UserListVoiceChannelProps = {
	channelID: string;
};

function UserListVoiceChannel({ channelID }: UserListVoiceChannelProps) {
	const voiceChannelMember = useSelector(selectVoiceChannelMembersByChannelId(channelID));
	
	return (
		<>
			{voiceChannelMember?.map((item: IChannelMember, index: number) => {
				return (
					<Fragment key={index}>
						<div className="hover:bg-[#36373D] w-[90%] flex p-1 ml-5 items-center gap-3 cursor-pointer rounded-sm">
							<div className="w-5 h-5 rounded-full scale-75">
								<div className="w-8 h-8 mt-[-0.3rem]">
									<AvatarComponent id={item.user?.id ?? ''} />
								</div>
							</div>
							<div>
								<NameComponent id={item.user?.id ?? ''} />
							</div>
						</div>
					</Fragment>
				);
			})}
		</>
	);
}

export default UserListVoiceChannel;
