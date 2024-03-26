import { selectNewestUserJoinedVoice } from '@mezon/store';
import { AvatarComponent, NameComponent } from '@mezon/ui';
import { Fragment } from 'react';
import { useSelector } from 'react-redux';

function UserListVoiceChannel() {
	const voiceChannelUser = useSelector(selectNewestUserJoinedVoice);
	console.log('voiceChannelUser', voiceChannelUser);

	return (
		<>
			{voiceChannelUser?.map((item) => {
				return (
					<Fragment key={item.id}>
						<div className="hover:bg-[#36373D] w-[90%] flex p-1 ml-5 items-center gap-3 cursor-pointer rounded-sm">
							<div className="w-5 h-5 rounded-full scale-75">
								{/* <img className="w-5 h-5 rounded-full" src={data.userAvt} alt={data.userAvt}></img> */}
								<div className="w-8 h-8 mt-[-0.3rem]">
									<AvatarComponent id={item.userId ?? ''} />
								</div>
							</div>
							<div>
								<NameComponent id={item.userId ?? ''} />
							</div>
						</div>
					</Fragment>
				);
			})}
		</>
	);
}

export default UserListVoiceChannel;
