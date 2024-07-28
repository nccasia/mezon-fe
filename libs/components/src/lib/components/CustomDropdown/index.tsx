import { useState } from 'react';

interface ICustomDropdownProps {
	dropdownItems: string[];
	dropDownTitle: string;
}

const CustomDropdown = ({ dropdownItems, dropDownTitle }: ICustomDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	return (
		<div className="relative">
			<button
				id="dropdownDefaultButton"
				onClick={toggleDropdown}
				className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
				type="button"
			>
				<div>{dropDownTitle}</div>
				<svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
					<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
				</svg>
			</button>

			{isOpen && (
				<div
					id="dropdown"
					className="absolute w-full top-[40px] left-0 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700"
				>
					<ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
						<li>
							{dropdownItems.map((value, index) => (
								<div key={index} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">{value}</div>
							))}
						</li>
					</ul>
				</div>
			)}
		</div>
	);
};

export default CustomDropdown;
