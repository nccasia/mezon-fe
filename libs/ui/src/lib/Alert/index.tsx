import React, { useEffect, useState } from 'react';

interface AlertProps {
	description: string | undefined;
	onClick?: () => void;
}

export const AlertTitleTextWarning: React.FC<AlertProps> = ({ description, onClick }) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	useEffect(() => {
		if (description) {
			setIsOpen(true);
		}
	}, [description]);

	const handleClose = () => {
		onClick;
		setIsOpen(false);
	};

	return (
		<>
			{isOpen && (
				<div
					id="toast-danger flex"
					className="flex items-center justify-between z-50 w-full md:w-[684px] p-2 mb-4 text-gray-200 bg-gray-900 
          rounded-lg shadow dark:text-white dark:bg-gray-800 absolute bottom-0 xl:bottom-8 transform font-[Manrope]"
					role="alert"
				>
					<div className="flex items-center justify-center">
						<div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-white bg-red-800 rounded-lg dark:bg-red-800 dark:text-red-200">
							<svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
								<path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
							</svg>
							<span className="sr-only">Error icon</span>
						</div>
						<div className="ms-3 ml-2 text-sm font-normal flex-nowrap">{description}</div>
					</div>
					<button
						onClick={handleClose}
						type="button"
						className="ms-auto -mx-1.5 -my-1.5  text-gray-400 hover:text-gray-100 rounded-lg 
             p-1.5 hover:bg-gray-800 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500
              dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
						data-dismiss-target="#toast-danger"
						aria-label="Close"
					>
						<span className="sr-only">Close</span>
						<svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
							<path
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
							/>
						</svg>
					</button>
				</div>
			)}
		</>
	);
};
