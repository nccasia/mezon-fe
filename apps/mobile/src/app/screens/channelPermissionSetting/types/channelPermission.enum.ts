export enum EPermissionSetting {
	BasicView,
	AdvancedView
}

export enum EAdvancedPermissionSetting {
	AddRole,
	AddMember
}

export enum EPermissionStatus {
	None,
	Allow,
	Deny
}

export enum EOverridePermissionType {
	Member = 1,
	Role = 0
}

export enum ERequestStatus {
	Fulfilled = 'fulfilled',
	Rejected = 'rejected',
	Pending = 'pending'
}
