import { Icons } from '@mezon/ui';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';

type ItemPermissionProps = {
	id?: string;
	title?: string;
	active?: boolean;
	onSelect: (id: string, option: number, active?: boolean) => void;
};

export enum TypeChoose {
	Remove = 2,
	Or = 0,
	Tick = 1
}

const ItemPermission = forwardRef<{ reset: () => void }, ItemPermissionProps>((props, ref) => {
	const { id, title, active, onSelect } = props;

	const initChoose = useMemo(() => {
		switch (active) {
			case true:
				return TypeChoose.Tick;
			case false:
				return TypeChoose.Remove;
			default:
				return TypeChoose.Or;
		}
	}, [active]);

	const [choose, setChoose] = useState<TypeChoose>(initChoose);

	useEffect(() => {
		setChoose(initChoose);
	}, [initChoose]);

	useImperativeHandle(ref, () => ({
		reset: () => {
			setChoose(initChoose);
		}
	}));

	const handleSelect = (option: TypeChoose) => {
		setChoose(option);
	};

	const className = {
		wrapperClass: 'h-[26px] flex rounded-md overflow-hidden border dark:border-gray-700 border-gray-300 dark:bg-transparent bg-white',
		buttonClass: 'w-8 flex justify-center items-center border dark:border-gray-700 border-gray-300'
	};

	return (
		<div className="flex justify-between items-center">
			<p className="font-semibold text-base">{title}</p>
			<div className={className.wrapperClass}>
				<button
					className={`${className.buttonClass} ${choose === TypeChoose.Remove ? 'bg-colorDanger' : ''}`}
					onClick={() => {
						onSelect(id!, TypeChoose.Remove, false);
						handleSelect(TypeChoose.Remove);
					}}
				>
					<Icons.Close defaultSize="size-4" />
				</button>
				<button
					className={`${className.buttonClass} ${choose === TypeChoose.Or ? 'dark:bg-bgModifierHover bg-bgModifierHoverLight' : ''}`}
					onClick={() => {
						onSelect(id!, TypeChoose.Or);
						handleSelect(TypeChoose.Or);
					}}
				>
					<Icons.IconOr defaultSize="size-4" />
				</button>
				<button
					className={`${className.buttonClass} ${choose === TypeChoose.Tick ? 'bg-colorSuccess' : ''}`}
					onClick={() => {
						onSelect(id!, TypeChoose.Tick, true);
						handleSelect(TypeChoose.Tick);
					}}
				>
					<Icons.IconTick defaultSize="size-4" />
				</button>
			</div>
		</div>
	);
});

export default ItemPermission;
