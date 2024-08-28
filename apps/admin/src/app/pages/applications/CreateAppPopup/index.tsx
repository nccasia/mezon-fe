import { useAuth } from '@mezon/core';
import { createApplication, useAppDispatch } from '@mezon/store';
import { ApiAddAppRequest } from 'mezon-js/api.gen';
import { FormEvent, useState } from 'react';

interface ICreateAppPopup {
	togglePopup: () => void;
}

const CreateAppPopup = ({ togglePopup }: ICreateAppPopup) => {
	const [inputValue, setInputValue] = useState('');
	const [isChecked, setIsChecked] = useState(false);
	const [notification, setNotification] = useState<React.JSX.Element | null>(null);
	const { userProfile } = useAuth();
	const dispatch = useAppDispatch();

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!inputValue) {
			setNotification(
				<div className="p-3 dark:bg-[#6b373b] bg-[#fbc5c6] border border-red-500 rounded-md">
					A name is required to create your new application.
				</div>
			);
		} else if (inputValue && !isChecked) {
			return setNotification(
				<div className="p-3 dark:bg-[#6b373b] bg-[#fbc5c6] border border-red-500 rounded-md">
					The <span className="font-semibold hover:underline">Terms of Service</span> must be accepted.
				</div>
			);
		} else {
			setNotification(null);
			const createRequest: ApiAddAppRequest = {
				appname: inputValue,
				creator_id: userProfile?.user?.id,
				role: 0
			};
			await dispatch(createApplication({ request: createRequest }));
			togglePopup();
		}
	};

	const handleToggleCheckBox = () => {
		setIsChecked(!isChecked);
	};

	const handleInputOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};
	return (
		<div className="fixed inset-0 flex items-center justify-center z-50 bg-[#000000c9]">
			<form className="relative z-10 w-[450px]" onSubmit={handleSubmit}>
				<div className="dark:bg-[#313338] bg-white pt-[16px] px-[16px] flex flex-col gap-5 pb-5 rounded-t-md">
					<div className="dark:text-textDarkTheme text-textLightTheme text-[20px] font-semibold">Create an application</div>
					{notification}
					<div className="flex flex-col gap-2">
						<div className="text-[12px] font-semibold">
							NAME <span className="text-red-600">*</span>
						</div>
						<input
							onChange={handleInputOnchange}
							type="text"
							className="bg-bgLightModeThird dark:bg-[#1e1f22] outline-primary p-[10px] rounded-sm"
						/>
					</div>
					<div className="flex gap-2">
						<input checked={isChecked} onChange={handleToggleCheckBox} type="checkbox" className="w-6" />
						<div className="flex-1">
							By clicking Create, you agree to the Mezon{' '}
							<span className="text-blue-500 hover:underline">Developer Terms of Service</span> and{' '}
							<span className="text-blue-500 hover:underline">Developer Policy</span>
						</div>
					</div>
				</div>
				<div className="dark:bg-[#2b2d31] bg-[#f2f3f5] dark:text-textDarkTheme text-textLightTheme flex justify-end items-center gap-4 p-[16px] text-[14px] font-medium border-t dark:border-[#1e1f22] rounded-b-md">
					<div className="hover:underline cursor-pointer" onClick={togglePopup}>
						Cancel
					</div>
					<button type="submit" className="bg-blue-600 hover:bg-blue-800 text-white rounded-md px-[20px] py-[9px] cursor-pointer">
						Create
					</button>
				</div>
			</form>
		</div>
	);
};

export default CreateAppPopup;
