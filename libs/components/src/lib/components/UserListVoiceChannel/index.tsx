import { ChatContext } from '@mezon/core';
import { RootState } from '@mezon/store';
import { AvatarComponent, NameComponent } from '@mezon/ui';
import { DataVoiceSocketOptinals } from '@mezon/utils';
import { Fragment, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export type UserListVoiceChannelProps = {
	channelID: string;
};

function UserListVoiceChannel({ channelID }: UserListVoiceChannelProps) {
	const voiceChannelMember = useSelector((state: RootState) => state.channelMembers.voiceChannelMember);
	const { userJoinedVoiceChannelList, setUserJoinedVoiceChannelList } = useContext(ChatContext);
	const { userJoinedVoiceChannel, setUserJoinedVoiceChannel } = useContext(ChatContext);
	const [voiceCombineUser, setVoiceCombineUser] = useState<DataVoiceSocketOptinals[]>([]);

	function filterDuplicateIds(arr: any) {
		const uniqueIds = new Set();
		const result: any = [];

		arr.forEach((obj: any) => {
			const key = obj.id + obj.user.id;
			if (!uniqueIds.has(key)) {
				result.push(obj);
				uniqueIds.add(key);
			}
		});
		return result;
	}
	const filterVoiceMember = filterDuplicateIds(voiceChannelMember);
	const convertMemberToVoiceData = () => {
		const newArray: any = [];
		for (const item of filterVoiceMember) {
			const newItem: any = {
				clanId: '',
				clanName: '',
				id: '',
				lastScreenshot: '',
				participant: item.user?.username,
				userId: item.user?.id,
				voiceChannelId: item.id,
				voiceChannelLabel: '',
			};
			newArray.push(newItem);
		}
		return newArray;
	};

	const voiceMemberConverted = convertMemberToVoiceData();

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setVoiceCombineUser(voiceMemberConverted);
		}, 100);

		return () => clearTimeout(timeoutId);
	});


	useEffect(() => {
		setVoiceCombineUser(voiceMemberConverted);
		if (userJoinedVoiceChannelList && userJoinedVoiceChannelList) {
			const voiceUserCombineTemparay = [...voiceMemberConverted, ...userJoinedVoiceChannelList];
			return setVoiceCombineUser(voiceUserCombineTemparay);
		}
	}, [userJoinedVoiceChannel, channelID]);

	return (
		<>
			{voiceCombineUser?.map((item: any, index: number) => {
				if (item.voiceChannelId === channelID) {
					return (
						<Fragment key={index}>
							<div className="hover:bg-[#36373D] w-[90%] flex p-1 ml-5 items-center gap-3 cursor-pointer rounded-sm">
								<div className="w-5 h-5 rounded-full scale-75">
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
				}
			})}
		</>
	);
}

export default UserListVoiceChannel;
