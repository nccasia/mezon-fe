import { useEscapeKey } from '@mezon/core';
import { categoriesActions, selectCurrentClan, useAppDispatch } from '@mezon/store';
import { ICategory, ValidateSpecialCharacters } from '@mezon/utils';
import { ApiUpdateCategoryDescRequest } from 'mezon-js/api.gen';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import ModalSaveChanges from '../ClanSettings/ClanSettingOverview/ModalSaveChanges';

interface IOverViewSettingProps {
	category: ICategory | null;
	onClose: () => void;
}

const OverviewSetting: React.FC<IOverViewSettingProps> = ({ category, onClose }) => {
	const [categoryName, setCategoryName] = useState(category?.category_name || '');
	const [isInvalidName, setIsInvalidName] = useState(!ValidateSpecialCharacters().test(categoryName));
	const hasChanged = useMemo(() => {
		return categoryName !== category?.category_name;
	}, [categoryName, category?.category_name]);
	const dispatch = useAppDispatch();
	const currentClan = useSelector(selectCurrentClan);

	const handleChangeCategoryName = (categoryName: string) => {
		setCategoryName(categoryName);

		const regex = ValidateSpecialCharacters();

		if (categoryName.length === 0 || categoryName.length === 64 || !regex.test(categoryName)) {
			setIsInvalidName(true);
		} else {
			setIsInvalidName(false);
		}
	};

	const handleSave = () => {
		const request: ApiUpdateCategoryDescRequest = {
			category_id: category?.category_id || '',
			category_name: categoryName
		};
		dispatch(
			categoriesActions.updateCategory({
				clanId: currentClan?.clan_id || '',
				request: request
			})
		);
	};

	const handleReset = () => {
		setCategoryName(category?.category_name || '');
	};

	useEscapeKey(() => {
		if (hasChanged) {
			handleReset();
		} else {
			onClose();
		}
	});

	const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && !isInvalidName) {
			handleSave();
		}
	};

	return (
		<>
			<div className="flex flex-1 flex-col">
				<h3 className="text-xs font-bold dark:text-textSecondary text-textSecondary800 uppercase mb-2">Category Name</h3>
				<div className="w-full">
					<input
						type="text"
						value={categoryName}
						onChange={(e) => handleChangeCategoryName(e.target.value)}
						className="dark:text-[#B5BAC1] text-textLightTheme outline-none w-full h-10 p-[10px] dark:bg-bgInputDark bg-bgLightModeSecond text-base rounded placeholder:text-sm"
						placeholder="Enter your category name here..."
						maxLength={Number(process.env.NX_MAX_LENGTH_NAME_ALLOWED)}
						onKeyDown={handlePressEnter}
					/>
				</div>
				{isInvalidName && (
					<p className="text-[#e44141] text-xs italic font-thin">
						Please enter a valid channel name (max 64 characters, only words, numbers, _ or -).
					</p>
				)}
			</div>

			{hasChanged && !isInvalidName && <ModalSaveChanges onSave={handleSave} onReset={handleReset} />}
		</>
	);
};

export default OverviewSetting;
