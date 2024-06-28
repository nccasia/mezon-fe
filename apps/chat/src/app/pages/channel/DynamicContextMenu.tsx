import { ContextMenuItem } from '@mezon/utils';
import { useMemo } from 'react';
import { Item, Menu, Separator, Submenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

type Props = {
	menuId: string;
	items: ContextMenuItem[];
};

export default function DynamicContextMenu({ menuId, items }: Props) {
	const children = useMemo(() => {
		const elements: React.ReactNode[] = [];
		for (let index = 0; index < items.length; index++) {
			const item = items[index];

			elements.push(
				<Item key={item.label} onClick={item.handleItemClick} disabled={item.disabled}>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
						<span>{item.label}</span>
						{item.icon}
					</div>
				</Item>,
			);
			if (index !== items.length - 1) elements.push(<Separator key={`separator-${index}`} />);
			if (item.hasSubmenu)
				elements.push(
					<Submenu label={item.label}>
						{item.subMenuItems?.map((subMenuItem) => (
							<Item key={subMenuItem.id} onClick={subMenuItem.handleItemClick} disabled={subMenuItem.disabled}>
								{subMenuItem.label}
							</Item>
						))}
					</Submenu>,
				);
		}
		return elements;
	}, [items]);

	return (
		<Menu id={menuId} theme="dark">
			{children}
		</Menu>
	);
}
