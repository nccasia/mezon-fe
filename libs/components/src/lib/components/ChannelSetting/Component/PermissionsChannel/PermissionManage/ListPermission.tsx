import { selectAllPermissionRoleChannel, selectPermissionChannel } from '@mezon/store';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useSelector } from 'react-redux';
import ItemPermission from './ItemPermission';

export type ListPermissionHandle = {
	reset: () => void;
};

type ItemListPermissionProps = {
	onSelect: (id: string, option: number, active?: boolean) => void;
};

const ListPermission = forwardRef<ListPermissionHandle, ItemListPermissionProps>((props, ref) => {
	const { onSelect } = props;
	const listPermission = useSelector(selectPermissionChannel);
	const listPermissionRoleChannel = useSelector(selectAllPermissionRoleChannel);
	const itemRefs = useRef<{ [key: string]: { reset: () => void } }>({});

	useImperativeHandle(ref, () => ({
		reset: () => {
			Object.values(itemRefs.current).forEach((item) => item.reset());
		}
	}));

	useEffect(() => {
		Object.values(itemRefs.current).forEach((item) => item.reset());
	}, [listPermissionRoleChannel]);

	return (
		<div className="basis-2/3">
			<h4 className="uppercase font-bold text-xs text-contentTertiary mb-2">General Channel Permissions</h4>
			<div className="space-y-2">
				{listPermission.map((item, index) => {
					const matchingRoleChannel = listPermissionRoleChannel.find((roleChannel) => roleChannel.permission_id === item.id);

					return (
						<ItemPermission
							key={item.id}
							id={item.id}
							title={item.title}
							active={matchingRoleChannel?.active}
							onSelect={onSelect}
							ref={(el) => (itemRefs.current[item.id] = el!)}
						/>
					);
				})}
			</div>
		</div>
	);
});

export default ListPermission;
