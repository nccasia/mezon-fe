import { categoriesActions, CategoriesEntity, selectAllCategories, selectCurrentClanId, useAppDispatch, useAppSelector } from '@mezon/store';
import { ApiCategoryOrderUpdate } from 'mezon-js/api.gen';
import { useRef, useState } from 'react';

enum EDragBorderPositon {
	TOP = 'top',
	BOTTOM = 'bottom'
}

const CategoryOrderSetting = () => {
	const categoryList: CategoriesEntity[] = useAppSelector(selectAllCategories);
	const currentClanId = useAppSelector(selectCurrentClanId);
	const [categoryListState, setCategoryListState] = useState<CategoriesEntity[]>(categoryList);
	const dragItemIndex = useRef<number | null>(null);
	const dragOverItemIndex = useRef<number | null>(null);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [hasChanged, setHasChanged] = useState<boolean>(false);
	const [dragBorderPosition, setDragBorderPosition] = useState<EDragBorderPositon | null>(null);
	const dispatch = useAppDispatch();

	const handleDragStart = (index: number) => {
		dragItemIndex.current = index;
	};

	const handleDragEnter = (index: number) => {
		dragOverItemIndex.current = index;
		setHoveredIndex(index);

		if (dragItemIndex.current !== null && dragOverItemIndex.current !== null) {
			if (dragItemIndex.current > dragOverItemIndex.current) {
				setDragBorderPosition(EDragBorderPositon.TOP);
			} else if (dragItemIndex.current < dragOverItemIndex.current) {
				setDragBorderPosition(EDragBorderPositon.BOTTOM);
			}
		}
	};

	const handleDragEnd = () => {
		setDragBorderPosition(null);
		setHoveredIndex(null);

		if (dragItemIndex.current !== null && dragOverItemIndex.current !== null) {
			const copyCategoryList = [...categoryListState];
			const [draggedItem] = copyCategoryList.splice(dragItemIndex.current, 1);
			copyCategoryList.splice(dragOverItemIndex.current, 0, draggedItem);

			setCategoryListState(copyCategoryList);
			setHasChanged(true);
		}

		dragItemIndex.current = null;
		dragOverItemIndex.current = null;
	};

	const handleSave = () => {
		const categoriesOrderChanges: ApiCategoryOrderUpdate[] =
			categoryListState.map((category, index) => ({
				category_id: category.category_id,
				order: index + 1
			})) || [];

		dispatch(
			categoriesActions.updateCategoriesOrder({
				clan_id: currentClanId || '',
				categories: categoriesOrderChanges
			})
		);
		setHasChanged(false);
	};

	const handleReset = () => {
		setCategoryListState(categoryList);
		setHasChanged(false);
	};

	const handleDeleteCategoriesOrder = () => {
		dispatch(categoriesActions.deleteCategoriesOrder(currentClanId || ''));
	};

	return (
		<div className="overflow-y-auto">
			{categoryListState.map((category, index) => (
				<div
					key={category.category_id}
					className={`${
						index !== categoryListState.length - 1 && 'border-b'
					} cursor-grab hover:bg-bgLightTertiary hover:dark:bg-bgModifierHover border-borderDividerLight dark:border-borderDivider
					${
						hoveredIndex === index
							? dragBorderPosition === EDragBorderPositon.BOTTOM
								? 'border-b-4 border-b-green-500 dark:border-b-green-500'
								: 'border-t-4 border-t-green-500 dark:border-t-green-500'
							: ''
					}`}
					draggable
					onDragStart={() => handleDragStart(index)}
					onDragEnter={() => handleDragEnter(index)}
					onDragEnd={handleDragEnd}
				>
					<p className="p-2 truncate dark:text-textPrimary text-textPrimaryLight uppercase">{category.category_name}</p>
				</div>
			))}
			{hasChanged && (
				<div className="flex flex-row justify-end gap-[20px] mt-10">
					<button onClick={handleReset} className="rounded px-4 py-1.5 hover:underline dark:text-textPrimary text-textPrimaryLight">
						Reset
					</button>
					<button onClick={handleSave} className="bg-blue-600 rounded-[4px] px-4 py-1.5 text-nowrap text-white">
						Save Changes
					</button>
				</div>
			)}
		</div>
	);
};

export default CategoryOrderSetting;
