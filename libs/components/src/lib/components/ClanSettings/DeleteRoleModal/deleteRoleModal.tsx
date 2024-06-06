interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	handleDelete: () => void;
}

export const DeleteModal: React.FC<ModalProps> = ({ isOpen, handleDelete, onClose }) => {
	return (
		// eslint-disable-next-line react/jsx-no-useless-fragment
		<>
			{isOpen && (
				<div className="fixed  inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
					<div className="relative z-10 dark:bg-gray-900  bg-bgLightMode p-6 rounded-md text-center dark:text-textDarkTheme text-textLightTheme">
						<h2 className="text-[30px] font-semibold mb-4">DELETE ROLE</h2>
						<p className="text-white-600 text-[16px] whitespace-break-spaces">
							Are you sure you want to delete the new role role? This action cannot be undone
						</p>
						<div className="flex justify-center mt-10 text-[14px] gap-x-5">
							<button
								color="gray"
								onClick={onClose}
								className="px-4 py-2 bg-gray-300 text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring focus:border-blue-300 rounded"
							>
								Cancel
							</button>
							<button
								color="blue"
								onClick={() => {
									handleDelete();
									onClose();
								}}
								className="px-4 py-2 bg-blue-700 text-white hover:bg-blue-500 focus:outline-none focus:ring focus:border-blue-300 rounded"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};
