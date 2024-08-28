import { Icons } from '@mezon/components';
import { selectAllUsesClan } from '@mezon/store';
import { Dropdown, Pagination } from 'flowbite-react';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import MemberTopBar from './MemberTopBar';
import TableMember from './TableMember';

const MemberClan = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(5);
	const usersClan = useSelector(selectAllUsesClan);
	const totalPages = useMemo(() => {
		return Math.ceil(usersClan.length / pageSize);
	}, [usersClan.length, pageSize]);

	const onPageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleChangePageSize = (pageSize: number) => {
		setPageSize(pageSize);
		setCurrentPage(1);
	};

	return (
		<div className="flex flex-col flex-1 shrink min-w-0 w-full dark:bg-bgSecondaryHover bg-bgLightModeThird h-[100%] overflow-y-auto z-0 p-4">
			<div className="flex flex-col dark:bg-bgPrimary bg-bgLightMode rounded-lg dark:text-textDarkTheme text-textLightTheme">
				<MemberTopBar />

				<TableMember currentPage={currentPage} pageSize={pageSize} />

				<div className="flex flex-row justify-between items-center px-4 h-[54px] border-t-[1px] dark:border-borderDivider border-buttonLightTertiary mb-2">
					<div className={'flex flex-row items-center'}>
						Show
						<Dropdown
							value={pageSize}
							renderTrigger={() => (
								<div
									className={
										'flex flex-row items-center justify-center text-center dark:bg-slate-800 bg-slate-300 dark:text-contentTertiary text-colorTextLightMode border-[1px] dark:border-borderDivider border-buttonLightTertiary rounded mx-1 px-3 w-12'
									}
								>
									<span className="mr-1">{pageSize}</span>
									<Icons.ArrowDown />
								</div>
							)}
							label={''}
						>
							<Dropdown.Item
								className={'dark:hover:bg-bgModifierHover hover:bg-bgModifierHoverLight'}
								onClick={() => handleChangePageSize(3)}
							>
								3
							</Dropdown.Item>
							<Dropdown.Item
								className={'dark:hover:bg-bgModifierHover hover:bg-bgModifierHoverLight'}
								onClick={() => handleChangePageSize(5)}
							>
								5
							</Dropdown.Item>
							<Dropdown.Item
								className={'dark:hover:bg-bgModifierHover hover:bg-bgModifierHoverLight'}
								onClick={() => handleChangePageSize(10)}
							>
								10
							</Dropdown.Item>
						</Dropdown>
						members of {usersClan.length}
					</div>
					<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
				</div>
			</div>
		</div>
	);
};

export default MemberClan;
