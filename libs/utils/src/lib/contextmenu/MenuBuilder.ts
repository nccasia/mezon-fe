import React from 'react';
import { ItemParams } from 'react-contexify';

type ConditionValue = boolean | (() => boolean) | undefined | null | number | string;

export type ContextMenuItem = {
	id?: string;
	label: string;
	handleItemClick?: (args?: ItemParams<any, any> | any) => void;
	icon?: React.ReactNode;
	subMenuItems?: ContextMenuItem[] | null;
	hasSubmenu?: boolean;
	disabled?: boolean;
	classNames?: string;
};

export type MenuBuilderPluginSetup = (builder: MenuBuilder) => void;

export type MenuBuilderPlugin = {
	setup: MenuBuilderPluginSetup;
};
export class MenuBuilder {
	private plugins: MenuBuilderPlugin[] = [];
	private items: ContextMenuItem[] = [];

	constructor(plugins?: MenuBuilderPlugin[]) {
		this.plugins = plugins || [];
	}

	addMenuItem(
		id: string,
		label: string,
		handleItemClick?: (...args: any[]) => void,
		icon?: any,
		subMenuItems = null,
		hasSubmenu = false,
		disabled = false,
		classNames?: string
	): MenuBuilder {
		this.items.push(this.craftMenuItem(id, label, handleItemClick, icon, subMenuItems, hasSubmenu, disabled, classNames));
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
		this.runPlugins();
		return this.items;
	}

	private runPlugins() {
		this.plugins.forEach((plugin) => plugin.setup(this));
	}

	private craftMenuItem(
		id: string,
		label: string,
		handleItemClick?: () => void,
		icon?: any,
		subMenuItems = null,
		hasSubmenu = false,
		disabled = false,
		classNames?: string
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
			classNames
		};
	}
}
