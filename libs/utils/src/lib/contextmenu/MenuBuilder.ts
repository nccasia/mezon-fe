import React from 'react';
import { ItemParams } from 'react-contexify';

type ConditionValue = boolean | (() => boolean) | undefined | null | number | string;

export type ContextMenuItem = {
	id?: string;
	label: string;
	handleItemClick?: (args: ItemParams<any, any>) => void;
	icon?: React.ReactNode;
	subMenuItems?: ContextMenuItem[] | null;
	hasSubmenu?: boolean;
	disabled?: boolean;
};

export class MenuBuilder {
	private items: ContextMenuItem[] = [];

	addMenuItem(
		id: string,
		label: string,
		handleItemClick?: () => void,
		icon?: any,
		subMenuItems = null,
		hasSubmenu = false,
		disabled = false,
	): MenuBuilder {
		this.items.push(this.craftMenuItem(id, label, handleItemClick, icon, subMenuItems, hasSubmenu, disabled));
		return this;
	}

	addSeparator(): MenuBuilder {
		this.items.push(this.craftMenuItem('separator', 'separator'));
		return this;
	}

	removeMenuItem(id: string): MenuBuilder {
		this.items = this.items.filter((item) => item.id !== id);
		return this;
	}

	when(condition: ConditionValue, callback: (builder: MenuBuilder) => void): MenuBuilder {
		if (condition) {
			callback(this);
		}
		return this;
	}

	build(): ContextMenuItem[] {
		return this.items;
	}

	private craftMenuItem(
		id: string,
		label: string,
		handleItemClick?: () => void,
		icon?: any,
		subMenuItems = null,
		hasSubmenu = false,
		disabled = false,
	): ContextMenuItem {
		const clickHandler = handleItemClick || (() => console.log('No handler for this item'));
		return {
			id,
			label,
			handleItemClick: clickHandler,
			icon,
			subMenuItems,
			hasSubmenu,
			disabled,
		};
	}
}
