import { ChatContext, useClans } from '@mezon/core';
import { DataVoiceSocketOptinals, selectCurrentChannelId, selectNewestUserJoinedVoice } from '@mezon/store';
import { AvatarComponent, NameComponent } from '@mezon/ui';
import { Fragment, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';

export type UserListVoiceChannelProps = {
	channelID: string | undefined;
	channelType: number | undefined;
};

function UserListVoiceChannel({ channelID, channelType }: UserListVoiceChannelProps) {
	const currentChannelId = useSelector(selectCurrentChannelId);
	const { currentClan } = useClans();

	console.log('channelID', channelID);

	const voiceChannelUser = useSelector(selectNewestUserJoinedVoice);

	const { userJoinedVoiceChannel, setUserJoinedVoiceChannel } = useContext(ChatContext);
	const { userJoinedVoiceChannelList, setUserJoinedVoiceChannelList } = useContext(ChatContext);
	const { voiceChannelMemberList, setVoiceChannelMemberList } = useContext(ChatContext);

	console.log('userJoinedVoiceChannel', userJoinedVoiceChannel);
	console.log('userJoinedVoiceChannelList', userJoinedVoiceChannelList);
	console.log('voiceChannelMemberList', voiceChannelMemberList);

	function removeDuplicatesByUserIdAndVoiceChannelId(arr: any[]) {
		const visitedEntries = new Set<string>();
		let i = 0;

		while (i < arr.length) {
			const entry = arr[i];
			if (entry.userId !== undefined && entry.voiceChannelId !== undefined) {
				const key = entry.userId + entry.voiceChannelId;
				if (!visitedEntries.has(key)) {
					visitedEntries.add(key);
					i++;
				} else {
					arr.splice(i, 1);
				}
			} else {
				arr.splice(i, 1);
			}
		}
	}

	// useEffect(() => {
	// 	let arrCombine: DataVoiceSocketOptinals[] = [];
	// 	if (!voiceChannelMemberList) {
	// 		arrCombine = [...(voiceChannelUser ?? [])];
	// 	} else if (!voiceChannelUser) {
	// 		arrCombine = [...(voiceChannelMemberList ?? [])];
	// 	} else {
	// 		arrCombine = [...voiceChannelMemberList, ...voiceChannelUser];
	// 	}
	// 	removeDuplicatesByUserIdAndVoiceChannelId(arrCombine);
	// 	return setVoiceUserCombine(arrCombine);
	// }, [memberHandled, voiceChannelUser, currentClan?.clan_id]);

	// console.log('memberHandled', memberHandled);

	return (
		<>
			{voiceChannelMemberList?.map((item: DataVoiceSocketOptinals, index: number) => {
				// if (item.voiceChannelId === channelID) {
				return (
					<Fragment key={index}>
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
				// }
			})}
		</>
	);
}

export default UserListVoiceChannel;
