export type ModalExitProps = {
	onClose: () => void;
};
const ExitSetting = (props: ModalExitProps) => {
	const { onClose } = props;
	const handleClose = () => {
		onClose();
	};
	return (
		<div className="bg-bgSecondary w-1/12 xl:w-1/5 2xl:flex-grow">
			<div className="w-1/4 text-black ml-5 pt-[94px]">
				<button
					className="bg-[#AEAEAE] w-[30px] h-[30px] rounded-[50px] font-bold transform hover:scale-105 hover:bg-slate-400 transition duration-300 ease-in-out"
					onClick={handleClose}
				>
					X
				</button>
				<p className="text-[#AEAEAE] mt-[10px]">ESC</p>
			</div>
		</div>
	);
};

export default ExitSetting;
