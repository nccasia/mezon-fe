import { InputField } from '@mezon/ui';
import { Modal } from 'flowbite-react';
import { useState } from 'react';

type ModalCreateCategoryProps = {
	openCreateCate: boolean;
	onClose: () => void;
	onCreateCategory: (nameCate: string) => void;
};

const ModalCreateCategory = ({ openCreateCate, onClose, onCreateCategory }: ModalCreateCategoryProps) => {
	const [nameCate, setNameCate] = useState('');
	const [checkvalidate, setCheckValidate] = useState(true);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setNameCate(value);
		if (/^[A-Za-z0-9_-]{0,64}$/.test(value) && value !== '') {
			setCheckValidate(false);
		} else {
			setCheckValidate(true);
		}
	};

	const handleCreateCate = () => {
		onCreateCategory(nameCate);
		setNameCate('');
	};

	return (
		<Modal
			show={openCreateCate}
			dismissible={true}
			onClose={onClose}
			className="bg-[#111111] dark:text-contentPrimary text-black bg-opacity-80"
			size="lg"
		>
			<div className="dark:bg-[#1E1E1E] bg-bgLightMode flex items-center justify-between px-6 pt-4 border-solid border-borderDefault rounded-tl-[5px] rounded-tr-[5px]">
				<div className="text-[19px] font-bold uppercase">Create Category</div>
				<button className="flex items-center justify-center opacity-50" onClick={onClose}>
					<span className="text-4xl dark:hover:text-white hover:text-black">×</span>
				</button>
			</div>
			<Modal.Body className="dark:bg-[#1E1E1E] bg-bgLightMode px-6 py-4">
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
				{checkvalidate && (
					<p className="text-[#e44141] text-xs italic font-thin">
						Please enter a valid channel name (max 64 characters, only words, numbers, _ or -).
					</p>
				)}
			</Modal.Body>
			<div className=" text-white font-semibold text-sm flex dark:bg-bgTertiary bg-bgLightMode justify-end flex-row items-center gap-4 py-4 px-6 rounded-bl-[5px] rounded-br-[5px]">
				<button onClick={onClose}>Cancel</button>
				<button
					className={`px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 bg-primary ${checkvalidate ? 'opacity-50 cursor-not-allowed' : ''}`}
					onClick={handleCreateCate}
					disabled={checkvalidate}
				>
					Create Category
				</button>
			</div>
		</Modal>
	);
};

export default ModalCreateCategory;
