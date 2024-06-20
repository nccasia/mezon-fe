import { Icons } from "@mezon/components";
import { channelUsersActions, selectCurrentClanId, selectRolesByChannelId, useAppDispatch } from "@mezon/store";
import { IChannel } from "@mezon/utils";
import { useMemo } from "react";
import { useSelector } from "react-redux";

type ListRolePermissionProps = {
    channel: IChannel;
}

const ListRolePermission = (props: ListRolePermissionProps) => {
    const {channel} = props;
	const dispatch = useAppDispatch();
	const RolesChannel = useSelector(selectRolesByChannelId(channel.id));
	const currentClanId = useSelector(selectCurrentClanId);

    const listRolesInChannel = useMemo(() => {
		if (!RolesChannel) return [];
		return RolesChannel.filter((role) => typeof role.role_channel_active === 'number' && role.role_channel_active === 1);
	}, [RolesChannel]);

    const deleteRole = async (roleId: string) => {
		const body = {
			channelId: channel.id,
			clanId: currentClanId || '',
			roleId: roleId,
			channelType: channel.type,
		};
		await dispatch(channelUsersActions.removeChannelRole(body));
	};
    return (
        listRolesInChannel.map((role) => (
            <div className={`flex justify-between py-2 rounded`} key={role.id}>
                <div className="flex gap-x-2 items-center">
                    <Icons.RoleIcon defaultSize="w-[23px] h-5" />
                    <p className="text-sm">{role.title}</p>
                </div>
                <div className="flex items-center gap-x-2">
                    <p className="text-xs text-[#AEAEAE]">Role</p>
                    <div onClick={() => deleteRole(role?.id || '')} role="button">
                        <Icons.EscIcon defaultSize="size-[15px] cursor-pointer" />
                    </div>
                </div>
            </div>
        ))
    );
}

export default ListRolePermission;