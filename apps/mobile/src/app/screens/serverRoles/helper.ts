import { RolesClanEntity } from "@mezon/store-mobile";
import { EPermission } from "@mezon/utils";

interface ICheckViewRole {
  role: RolesClanEntity,
  isClanOwner: boolean,
  userPermissionsStatus: { [key in EPermission]: boolean }
}

export const checkCanEditPermission = ({isClanOwner, userPermissionsStatus, role}: ICheckViewRole): boolean => {
  if (isClanOwner) {
    return true;
  }

  const adminPermission = role?.permission_list?.permissions?.find(r => r.slug === EPermission.administrator);
  if (adminPermission?.active) {
    return false;
  }

  const manageClanPermission = role?.permission_list?.permissions?.find(r => r.slug === EPermission.manageClan);
  if (userPermissionsStatus.administrator || (userPermissionsStatus["manage-clan"] && !manageClanPermission?.active)) {
    return true;
  }

  return false;
}
