import { selectMemberCustomStatusById, selectMemberOnlineStatusById } from '@mezon/store';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from './useAuth';

export function useMemberStatus(memberId: string) {
	const memberStatus = useSelector(selectMemberOnlineStatusById(memberId));
	const { userId } = useAuth();
	const status = useMemo(() => (userId === memberId ? true : memberStatus), [memberStatus, userId]);
	return status;
}

export function useMemberCustomStatus(memberId: string) {
	const memberStatus = useSelector(selectMemberCustomStatusById(memberId));
	return memberStatus;
}
