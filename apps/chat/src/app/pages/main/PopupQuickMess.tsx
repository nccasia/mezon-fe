import { useHandlePopupQuickMess } from '@mezon/core';
import { memo, useEffect } from 'react';

const PopupQuickMess = memo(() => {
	const { handleClosePopupQuickMess } = useHandlePopupQuickMess();

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Enter') {
				setTimeout(() => {
					handleClosePopupQuickMess();
				}, 100);
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, []);
	return (
		<div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-black bg-opacity-80 dark:text-white text-black hide-scrollbar overflow-hidden">
			<div className="relative w-full max-w-[440px] sm:h-auto undefined">
				<div className="rounded overflow-hidden">
					<div className="dark:bg-bgPrimary bg-white p-5 text-center space-y-7">
						<h4 className="font-semibold">WHOA THERE. WAY TOO SPICY!</h4>
						<p className="dark:text-contentTertiary text-colorTextLightMode">You're sending messages too quickly!</p>
					</div>
					<div className="dark:bg-bgSecondary bg-bgLightSecondary p-4">
						<p
							onClick={handleClosePopupQuickMess}
							className="text-white bg-primary hover:bg-opacity-80 rounded p-2 text-center text-sm font-semibold cursor-pointer"
						>
							Enter the chill zone
						</p>
					</div>
				</div>
			</div>
		</div>
	);
});

export default PopupQuickMess;
