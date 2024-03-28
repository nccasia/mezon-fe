import { ChatContext } from '@mezon/core';
import { AvatarComponent, NameComponent } from '@mezon/ui';
import { DataVoiceSocketOptinals } from '@mezon/utils';
import { useContext, useEffect } from 'react';

export type UserListVoiceChannelProps = {
	channelID: string;
	voiceChannelData: any;
};

function UserListVoiceChannel({ channelID, voiceChannelData }: UserListVoiceChannelProps) {
	const { dataVoiceChannelMember, setDataVoiceChannelMember } = useContext(ChatContext);
	const { userJoinedVoiceChannelList, setUserJoinedVoiceChannelList } = useContext(ChatContext);
	const { userJoinedVoiceChannel, setUserJoinedVoiceChannel } = useContext(ChatContext);

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
	const filterVoiceMember = filterDuplicateIds(voiceChannelData);
	const convertMemberToVoiceData = () => {
		const newArray: any = [];
		for (const item of filterVoiceMember) {
			const newItem: any = {
				clanId: '',
				clanName: '',
				id: item.id,
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

	useEffect(() => {
		setDataVoiceChannelMember(voiceMemberConverted);
	}, []);

	const filterByChannelId = (arr:DataVoiceSocketOptinals[], channelId:string) => {
		return arr.filter(item => item.voiceChannelId === channelId);
	};
	


	useEffect(() => {
		let arrCombine: DataVoiceSocketOptinals[] = [];
		if (!voiceMemberConverted && userJoinedVoiceChannelList) {
			arrCombine = [...userJoinedVoiceChannelList];
		} else if (!userJoinedVoiceChannelList && voiceMemberConverted) {
			arrCombine = [...voiceMemberConverted];
		} else if (voiceMemberConverted && userJoinedVoiceChannelList) {
			arrCombine = [...voiceMemberConverted, ...userJoinedVoiceChannelList];
		}
		removeDuplicatesByUserIdAndVoiceChannelId(arrCombine);
		console.log("-----")
		console.log("arrCombine",arrCombine);
		console.log("v",channelID)
		const filter = filterByChannelId(arrCombine, channelID)
		console.log("filter",filter);

		setDataVoiceChannelMember(filter);
	}, [userJoinedVoiceChannel, userJoinedVoiceChannelList]);
	return (
		<>
			{dataVoiceChannelMember?.map((item: any, index: number) => {
				console.log(dataVoiceChannelMember)
				if (item.voiceChannelId === channelID) {
					console.log(item);
					console.log(item.voiceChannelId);

					return (
						<div key={index} className="hover:bg-[#36373D] w-[90%] flex p-1 ml-5 items-center gap-3 cursor-pointer rounded-sm">
							<div className="w-5 h-5 rounded-full scale-75">
								<div className="w-8 h-8 mt-[-0.3rem]">
									<AvatarComponent id={item.userId} />
								</div>
							</div>
							<div>
								<NameComponent id={item.userId} />
							</div>
						</div>
					);
				} else {
					return <p>FFFFF</p>;
				}
			})}
		</>
	);
}

export default UserListVoiceChannel;

