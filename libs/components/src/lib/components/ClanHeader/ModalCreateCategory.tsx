import { Icons, InputField } from '@mezon/ui';
import { ValidateSpecialCharacters } from '@mezon/utils';
import { Modal } from 'flowbite-react';
import { useState } from 'react';

type ModalCreateCategoryProps = {
	openCreateCate: boolean;
	onClose: () => void;
	onCreateCategory: (nameCate: string) => void;
};

const ModalCreateCategory = ({ openCreateCate, onClose, onCreateCategory }: ModalCreateCategoryProps) => {
	const [nameCate, setNameCate] = useState('');
	const [checkValidate, setCheckValidate] = useState(true);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setNameCate(value);
		const regex = ValidateSpecialCharacters();
		if (regex.test(value) && value !== '') {
			setCheckValidate(false);
		} else {
			setCheckValidate(true);
		}
	};

	const handleCreateCate = () => {
		onCreateCategory(nameCate);
		setNameCate('');
	};

	const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.checked ? 1 : 0;
	};

	return (
		<Modal
			show={openCreateCate}
			dismissible={true}
			onClose={onClose}
			className="bg-[#111111] dark:text-contentPrimary text-black bg-opacity-80"
			size="lg"
		>
			<div className="dark:bg-bgPrimary bg-bgLightModeSecond flex items-center justify-between px-6 pt-4 border-solid border-borderDefault rounded-tl-[5px] rounded-tr-[5px]">
				<div className="text-[19px] font-bold uppercase">Create Category</div>
				<button className="flex items-center justify-center opacity-50" onClick={onClose}>
					<span className="text-4xl dark:hover:text-white hover:text-black">×</span>
				</button>
			</div>
			<Modal.Body className="dark:bg-bgPrimary bg-bgLightModeSecond px-6 py-4">
				<div className="flex flex-col">
					<span className="font-[600] text-sm ">What is category's name?</span>
					<InputField
						type="text"
						onChange={handleInputChange}
						placeholder="Enter the category's name"
						className="py-[8px] dark:bg-black bg-bgLightModeSecond text-[14px] mt-2 mb-0 border-blue-600 border"
						value={nameCate}
					/>
				</div>
				{checkValidate && (
					<p className="text-[#e44141] text-xs italic font-thin">
						Please enter a valid channel name (max 64 characters, only words, numbers, _ or -).
					</p>
				)}
				<div className="flex flex-row justify-between my-2 items-center">
					<div className="flex flex-row items-center">
						<Icons.LockIcon />
						<span className="dark:text-textSecondary text-textSecondary800 text-lg font-semibold">Private Category</span>
					</div>
					<div className="relative flex flex-wrap items-center">
						<input
							className="peer relative h-4 w-8 cursor-pointer appearance-none rounded-lg
               bg-slate-300 transition-colors after:absolute after:top-0 after:left-0 after:h-4 after:w-4 after:rounded-full
                after:bg-slate-500 after:transition-all checked:bg-blue-200 checked:after:left-4 checked:after:bg-blue-500
                 hover:bg-slate-400 after:hover:bg-slate-600 checked:hover:bg-blue-300 checked:after:hover:bg-blue-600
                  focus:outline-none checked:focus:bg-blue-400 checked:after:focus:bg-blue-700 focus-visible:outline-none disabled:cursor-not-allowed
                   disabled:bg-slate-200 disabled:after:bg-slate-300"
							type="checkbox"
							value={1}
							id="id-c01"
							onChange={handleToggle}
						/>
					</div>
				</div>
				<p className="dark:text-textSecondary text-textSecondary800 text-sm">
					By making a category private, only select members and roles will be able to view this category. Synced channels in this category
					will automatically match to this setting
				</p>
			</Modal.Body>
			<div className=" text-white font-semibold text-sm flex dark:bg-bgTertiary bg-bgLightMode justify-end flex-row items-center gap-4 py-4 px-6 rounded-bl-[5px] rounded-br-[5px]">
				<button onClick={onClose} className="dark:text-textSecondary text-textSecondary800">
					Cancel
				</button>
				<button
					className={`px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 bg-primary ${checkValidate ? 'opacity-50 cursor-not-allowed' : ''}`}
					onClick={handleCreateCate}
					disabled={checkValidate}
				>
					Create Category
				</button>
			</div>
		</Modal>
	);
};

export default ModalCreateCategory;
