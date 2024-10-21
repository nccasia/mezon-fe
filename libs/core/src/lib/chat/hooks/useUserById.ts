import {
	ChannelsEntity,
	selectChannelById2,
	selectClanView,
	selectDmGroupCurrentId,
	selectHashtagDmById,
	selectMembeGroupByUserId,
	selectMemberClanByUserId2,
	useAppSelector
} from '@mezon/store';
import { ChannelMembersEntity } from '@mezon/utils';

export const useUserById = (userID: string | undefined): ChannelMembersEntity | undefined => {
	return useAppSelector((state) => {
		if (!userID) return undefined;
		const currentDMId = selectDmGroupCurrentId(state);
		const isClanView = selectClanView(state);
		return isClanView
			? (selectMemberClanByUserId2(state, userID ?? '') as unknown as ChannelMembersEntity)
			: (selectMembeGroupByUserId(state, currentDMId as string, userID as string) as unknown as ChannelMembersEntity);
	});
};

export const useTagById = (tagId: string | undefined): ChannelsEntity | undefined => {
	return useAppSelector((state) => {
		if (!tagId) return undefined;
		const isClanView = selectClanView(state);
		return isClanView
			? (selectChannelById2(state, tagId) as unknown as ChannelsEntity)
			: (selectHashtagDmById(state, tagId) as unknown as ChannelsEntity);
	});
};
