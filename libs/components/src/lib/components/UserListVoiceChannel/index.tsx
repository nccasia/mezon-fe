import { useClans } from '@mezon/core';
import {
	DataVoiceSocketOptinals,
	selectCurrentChannelId,
	selectMemberStatus,
	selectMembersByChannelId,
	selectNewestUserJoinedVoice,
} from '@mezon/store';
import { AvatarComponent, NameComponent } from '@mezon/ui';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

export type UserListVoiceChannelProps = {
	channelID: string;
	channelType: number | undefined;
};

function UserListVoiceChannel({ channelID, channelType }: UserListVoiceChannelProps) {
	const currentChannelId = useSelector(selectCurrentChannelId);
	const { currentClan } = useClans();

	const rawMembers = useSelector(selectMembersByChannelId(currentChannelId));
	const onlineStatus = useSelector(selectMemberStatus);
	const onlineMembers = useMemo(() => {
		if (!rawMembers) return [];
		return rawMembers.filter((user) => user.user?.online === true);
	}, [onlineStatus, rawMembers]);

	const [memberHandled, setMemberHandled] = useState<DataVoiceSocketOptinals[]>();
	const voiceChannelUser = useSelector(selectNewestUserJoinedVoice);
	const [voiceUserCombine, setVoiceUserCombine] = useState<DataVoiceSocketOptinals[]>();

	const convertMemberToVoiceData = () => {
		const newArray: any = [];
		for (const item of onlineMembers) {
			const newItem: any = {
				clanId: '',
				clanName: '',
				id: '',
				lastScreenshot: '',
				participant: item.user?.username,
				userId: item.user?.id,
				voiceChannelId: item.channelId,
				voiceChannelLabel: '',
			};
			newArray.push(newItem);
		}
		setMemberHandled(newArray);
	};

	useEffect(() => {
		convertMemberToVoiceData();
	}, [channelID, channelType]);

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
		let arrCombine: DataVoiceSocketOptinals[] = [];

		if (!memberHandled && !voiceChannelUser) {
			setVoiceUserCombine([]);
		} else if (!memberHandled) {
			arrCombine = [...(voiceChannelUser ?? [])];
		} else if (!voiceChannelUser) {
			arrCombine = [...(memberHandled ?? [])];
		} else {
			arrCombine = [...memberHandled, ...voiceChannelUser];
		}
		removeDuplicatesByUserIdAndVoiceChannelId(arrCombine);
		return setVoiceUserCombine(arrCombine);
	}, [memberHandled, voiceChannelUser]);

	return (
		<>
			{voiceUserCombine?.map((item: DataVoiceSocketOptinals, index: number) => {
				if (item.voiceChannelId === channelID) {
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
				}
			})}
		</>
	);
}

export default UserListVoiceChannel;
