export const QRSection: React.FC = () => {
	return (
		<div className="hidden flex-col justify-start items-center w-fit h-fit p-0 gap-y-7 rounded-none lg:flex">
			<div className="w-[200px] h-[200px] flex items-center justify-center relative">
				<img src={'assets/images/qr-mezon.png'} className="rounded-[8px] border-[4px] border-[#ffffff]" alt="Mezon Logo" />
				<div className="absolute flex items-center justify-center">
					<img src={'assets/images/mezon-logo.png'} className="w-12 h-12" alt="QR Code" />
				</div>
			</div>
			<div className="flex flex-col justify-start items-center w-[210px] h-fit p-0 gap-y-1">
				<p className="text-base font-medium dark:text-[#ffffff] text-black leading-[150%]">Sign in by QR code</p>
				<p className="text-sm font-normal dark:text-[#cccccc] text-black leading-[130%]">Use Mezon on mobile to scan QR</p>
			</div>
		</div>
	);
};
