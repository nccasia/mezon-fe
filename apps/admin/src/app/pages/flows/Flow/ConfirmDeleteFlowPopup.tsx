const ConfirmDeleteFlowPopup = ({ onConfirm }: { onConfirm: () => void }) => {
	return (
		<div className="text-sm text-gray-500 dark:text-gray-400 w-[240px]">
			<div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
				<h3 id="default-popover" className="font-semibold text-gray-900 dark:text-white select-none text-center">
					Do you confirm delete this flow?
				</h3>
			</div>
			<div className="p-2 max-h-[400px] overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:[width:3px] [&::-webkit-scrollbar-thumb]:bg-red-500 transition-all">
				<button onClick={onConfirm} className="bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
					Confirm Delete
				</button>
			</div>
		</div>
	);
};

export default ConfirmDeleteFlowPopup;
