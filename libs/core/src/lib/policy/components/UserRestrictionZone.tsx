import { EPermission } from '@mezon/utils';
import { useUserRestriction } from '../hooks/deprecated/useUserRestriction';

export type UserRestrictionZoneProps = {
	permissions?: EPermission[];
	policy?: boolean | undefined | null;
	children: React.ReactNode;
	render?: (children: React.ReactNode, isAllowed: boolean) => React.ReactNode;
	condistion?: 'and' | 'or';
};

/**
 * @deprecated will be removed
 */
export function UserRestrictionZone({ policy, permissions = [], render, children, condistion = 'and' }: UserRestrictionZoneProps) {
	const isPermissionsAllowed = useUserRestriction(permissions);

	const isPolicyAllowed = typeof policy === 'boolean' ? policy : true;
	const isAllowed = condistion === 'and' ? isPermissionsAllowed && isPolicyAllowed : isPermissionsAllowed || isPolicyAllowed;
	const renderChildren = render ? render : (children: React.ReactNode, isAllowed: boolean) => (isAllowed ? children : null);

	return renderChildren(children, isAllowed);
}
