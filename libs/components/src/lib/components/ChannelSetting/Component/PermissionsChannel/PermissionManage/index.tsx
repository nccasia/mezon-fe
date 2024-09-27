import { Icons } from '@mezon/ui';
import React, { memo, useState } from 'react';
import MainPermissionManage from './MainPermissionManage';

type PermissionManageProps = {
	channelId: string;
	channelPrivate: boolean;
	setIsPrivateChannel: React.Dispatch<React.SetStateAction<boolean>>;
	setPermissionsListHasChanged: React.Dispatch<React.SetStateAction<boolean>>;
	saveTriggerRef: React.MutableRefObject<(() => void) | null>;
	resetTriggerRef: React.MutableRefObject<(() => void) | null>;
};

const PermissionManage: React.FC<PermissionManageProps> = ({
	channelId,
	channelPrivate,
	setIsPrivateChannel,
	setPermissionsListHasChanged,
	saveTriggerRef,
	resetTriggerRef
}) => {
	const [showRole, setShowRole] = useState(true);
	return (
		channelPrivate && (
			<div>
				<HeaderPermissionManage showRole={showRole} setShowRole={setShowRole} />
				{showRole && (
					<MainPermissionManage
						channelId={channelId}
						setIsPrivateChannel={setIsPrivateChannel}
						setPermissionsListHasChanged={setPermissionsListHasChanged}
						saveTriggerRef={saveTriggerRef}
						resetTriggerRef={resetTriggerRef}
					/>
				)}
			</div>
		)
	);
};

export default PermissionManage;

type HeaderPermissionManageProps = {
	showRole: boolean;
	setShowRole: React.Dispatch<React.SetStateAction<boolean>>;
};

const HeaderPermissionManage = memo(({ showRole, setShowRole }: HeaderPermissionManageProps) => {
	return (
		<div className="flex items-center gap-x-3.5 w-fit" onClick={() => setShowRole(!showRole)}>
			<h3 className="text-xl font-semibold">Advanced permissions</h3>
			<Icons.ArrowDown defaultSize={`size-5 dark:text-white text-black transition-all duration-300 ${showRole ? '' : '-rotate-90'}`} />
		</div>
	);
});
