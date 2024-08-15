import { useAppNavigation } from '@mezon/core';
import { authActions, selectIsLogin, selectTheme, useAppDispatch } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { Dropdown } from 'flowbite-react';
import isElectron from 'is-electron';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

function ApplicationsPage() {
	const { navigate } = useAppNavigation();
	const dispatch = useAppDispatch();
	const isLogin = useSelector(selectIsLogin);
	const deepLinkUrl = JSON.parse(localStorage.getItem('deepLinkUrl') as string);

	useEffect(() => {
		if (deepLinkUrl && isElectron()) {
			const data = JSON.parse(decodeURIComponent(deepLinkUrl));
			dispatch(authActions.setSession(data));
			localStorage.removeItem('deepLinkUrl');
		}
	}, [deepLinkUrl, dispatch]);

	useEffect(() => {
		if (isLogin) {
			navigate('/admin/applications');
		}
	}, [isLogin, navigate]);

	return (
		<div>
			<div className="mb-[40px]">
				<div className="flex flex-row justify-between w-full">
					<div className="text-[24px] font-medium">Applications</div>
					<div className="text-[15px] py-[10px] px-[16px] text-white bg-[#5865F2] hover:bg-[#4752c4] cursor-pointer rounded-sm">
						New Application
					</div>
				</div>
				<div className="text-[20px]">
					Develop <span className="text-blue-600 hover:underline cursor-pointer">apps</span> to customize and extend Discord for millions of
					users.
				</div>
			</div>
			<AppPageBottom />
		</div>
	);
}

const AppPageBottom = () => {
	const appearanceTheme = useSelector(selectTheme);
	const [dropdownValue, setDropdownValue] = useState('Date of Creation');
	const handleDropdownValue = (text: string) => {
		setDropdownValue(text);
	};
	const selectedDropdownClass = 'dark:bg-[#313338] bg-[#f2f3f5]';

	const isChooseAZ = useMemo(() => {
		return dropdownValue === 'A-Z';
	}, [dropdownValue]);

	const [isSmallSizeSort, setIsSmallSizeSort] = useState(true);

	return (
		<div>
			<div className="flex justify-between mb-[32px]">
				<div className="flex gap-4 w-fit items-center">
					<div>Sort by:</div>
					<Dropdown
						trigger="click"
						renderTrigger={() => (
							<div className="w-[170px] h-[40px] rounded-md dark:bg-[#1e1f22] bg-bgLightModeThird flex flex-row px-3 justify-between items-center">
								<p className="truncate max-w-[90%]">{dropdownValue}</p>
								<div>
									<Icons.ArrowDownFill />
								</div>
							</div>
						)}
						label=""
						placement="bottom-end"
						className={`dark:bg-black bg-white border-none py-[6px] px-[8px] max-h-[200px] overflow-y-scroll ${appearanceTheme === 'light' ? 'customSmallScrollLightMode' : 'thread-scroll'} z-20`}
					>
						<Dropdown.Item
							children={'Date of Creation'}
							onClick={() => {
								handleDropdownValue('Date of Creation');
							}}
							className={`truncate ${isChooseAZ ? '' : selectedDropdownClass}`}
						/>
						<Dropdown.Item
							children={'A-Z'}
							onClick={() => {
								handleDropdownValue('A-Z');
							}}
							className={`truncate ${isChooseAZ ? selectedDropdownClass : ''}`}
						/>
					</Dropdown>
				</div>
				<div className="flex w-fit gap-4">
					<div
						className={`cursor-pointer flex items-center gap-3 px-3 rounded-md ${isSmallSizeSort ? 'bg-[#e6e6e8] dark:bg-[#3f4147]' : ''}`}
						onClick={() => setIsSmallSizeSort(true)}
					>
						<div className={`w-5`}>
							<Icons.SortBySizeBtn />
						</div>
						<div>Small</div>
					</div>
					<div
						className={`cursor-pointer flex items-center gap-3 px-3 rounded-md ${!isSmallSizeSort ? 'bg-[#e6e6e8] dark:bg-[#3f4147]' : ''}`}
						onClick={() => setIsSmallSizeSort(false)}
					>
						<div className="w-5">
							<Icons.SortBySizeBtn />
						</div>
						<div>Large</div>
					</div>
				</div>
			</div>
			<AllApplications isSmallSizeSort={isSmallSizeSort}/>
		</div>
	);
};

const AllApplications = ({isSmallSizeSort} : {isSmallSizeSort: boolean}) => {
	const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	return (
		<div className="flex flex-col gap-5">
			<div className="text-[20px]">My Applications</div>
			<div className="flex flex-wrap gap-4 gap-x-4">
				{arr.map((value, index) => (
					<div
						key={index}
						className="dark:bg-[#2b2d31] bg-bgLightModeSecond p-[10px] w-fit rounded-md cursor-pointer hover:-translate-y-2 duration-200 hover:shadow-2xl"
					>
						<div className={`dark:bg-[#111214] bg-white  aspect-square flex justify-center items-center rounded-md ${isSmallSizeSort ? "w-[118px]" : "w-[196px]"}`}>K</div>
						<div className="w-full text-center">Komu bot</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ApplicationsPage;
