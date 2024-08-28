import { EPermission } from '@mezon/utils';
import React from 'react';
import { useUserPolicy } from '../hooks/useUserPolicy';

type Props = {
	readonly children: React.ReactNode;
	readonly clanId: string;
};

type MezonPolicyValue = {
	permissionKeys: EPermission[];
};

export const MezonPolicy = React.createContext<MezonPolicyValue>({
	permissionKeys: []
});

export function MezonPolicyProvider({ children, clanId }: Props) {
	const { permissionKeys } = useUserPolicy(clanId);

	const value = React.useMemo(() => ({ permissionKeys }), [permissionKeys]);

	return <MezonPolicy.Provider value={value}>{children}</MezonPolicy.Provider>;
}
