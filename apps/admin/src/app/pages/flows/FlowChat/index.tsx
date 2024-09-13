import { Icons } from '@mezon/ui';

const FlowChatPopup = () => {
	return (
		<div className="text-sm text-gray-500 dark:text-gray-200 w-[350px]">
			<div className="h-[65vh] overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:[width:3px] [&::-webkit-scrollbar-thumb]:bg-red-500 transition-all">
				<div className="flex items-center gap-2 p-2  bg-gray-200 dark:bg-gray-600">
					<div className="w-[40px] h-[40px]">
						<img alt="avt" src="http://localhost:3000/assets/robot-CdlpHV-J.png" className="w-[40px] h-[40px] rounded-full" />
					</div>
					<div>
						<span>Hi there! How can I help?</span>
					</div>
				</div>
			</div>
			<div className="footer p-2 border-[1px] border-t-gray-400 relative">
				<input className="my-1 block w-full px-3 py-3 border-[1px] focus:border-[1px] focus:border-gray-500 focus-visible:border-[1px] focus:ring-0 focus-visible:border-gray-400 focus-within:ring-0 focus:ring-transparent rounded-lg dark:bg-gray-700" />
				<button className=" w-[30px] h-[30px] flex items-center justify-center absolute right-[15px] top-[50%] rotate- translate-y-[-50%] bg-blue-500 hover:bg-blue-600 text-white rounded-md active:bg-blue-500 transition-all">
					<Icons.ReplyRightClick />
				</button>
			</div>
		</div>
	);
};
export default FlowChatPopup;
