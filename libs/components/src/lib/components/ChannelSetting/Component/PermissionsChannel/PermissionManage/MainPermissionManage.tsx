import { selectAllRolesClan, selectAllUsesClan, selectRolesByChannelId } from "@mezon/store";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import ListPermission from "./ListPermission";
import ListRoleMember from "./ListRoleMember";

const MainPermissionManage = ({channelID}:{channelID: string}) => {
    const RolesClan = useSelector(selectAllRolesClan);
    const RolesInChannel = useSelector(selectRolesByChannelId(channelID));
    const RolesNotInChannel = useMemo(() =>
        RolesClan.filter((role) => 
            !RolesInChannel.map((roleInChannel) => roleInChannel.id).includes(role.id)),
        [RolesClan, RolesInChannel]
    );
    const usersClan = useSelector(selectAllUsesClan);

    return(
        <div className="flex mt-4 gap-x-4">
            <ListRoleMember 
                listManageInChannel={RolesInChannel} 
                listManageNotInChannel={RolesNotInChannel}
                usersClan={usersClan}
            />
            <ListPermission />
        </div>
    )
}

export default MainPermissionManage;