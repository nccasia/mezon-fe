import { Icons } from '@mezon/ui';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiInstance } from '../../../services/apiInstance';

interface IMessage {
	message: {
		message: string;
		urlImage?: string[];
	};
	type: 'input' | 'output';
}
const FlowChatPopup = () => {
	const { flowId } = useParams();
	const [input, setInput] = useState('');
	const [messages, setMessages] = useState<IMessage[]>([]);
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!input) {
			toast.error('Please enter your message');
			return;
		}
		setMessages([...messages, { message: { message: input, urlImage: undefined }, type: 'input' }]);
		setInput('');
		try {
			const response: { message: string; urlImage: string } = await apiInstance.post(`/execution`, {
				flowId,
				input
			});
			let urlImage: string[] = [];
			try {
				urlImage = JSON.parse(response.urlImage);
			} catch {
				urlImage = [response.urlImage];
			}
			setMessages((prev) => [...prev, { message: { message: response.message, urlImage: urlImage }, type: 'output' }]);
		} catch (error) {
			setMessages((prev) => [...prev, { message: { message: "Sory, I dont't know", urlImage: undefined }, type: 'output' }]);
		}
	};
	return (
		<div className="text-sm text-gray-500 dark:text-gray-200 w-[350px]">
			<div className="flex items-center gap-2 p-2  bg-gray-200 dark:bg-gray-600">
				<div className="w-[40px] h-[40px]">
					<img
						alt="avt"
						src="https://st3.depositphotos.com/8950810/17657/v/1600/depositphotos_176577870-stock-illustration-cute-smiling-funny-robot-chat.jpg"
						className="w-[40px] h-[40px] rounded-full"
					/>
				</div>
				<div>
					<span>Hi there! How can I help?</span>
				</div>
			</div>
			<div className="h-[60vh] overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:[width:3px] [&::-webkit-scrollbar-thumb]:bg-red-500 transition-all">
				{messages.map((message, index) => (
					<div
						key={index}
						className={`p-2 shadow-inner flex ${message.type === 'input' ? 'bg-gray-50 dark:bg-gray-600 justify-end text-end' : 'bg-gray-100 dark:bg-gray-700 justify-start'}`}
					>
						<div className="w-[70%]">
							<span>{message.message.message}</span>
							<div className="bg-gray-100">
								{message.message.urlImage?.map((img, index) => (
									<div key={index} className="p-2 shadow-inner bg-[#ebeaead4] rounded-lg mb-1">
										<img src={img} alt="img" className="max-w-[100%] object-cover" />
									</div>
								))}
							</div>
						</div>
					</div>
				))}
			</div>
			<form onSubmit={handleSubmit}>
				<div className="footer p-2 border-[1px] border-t-gray-400 relative">
					<input
						value={input}
						disabled={flowId === undefined}
						onChange={(e) => setInput(e.target.value)}
						className="my-1 block w-full px-3 py-3 border-[1px] focus:border-[1px] focus:border-gray-500 focus-visible:border-[1px] focus:ring-0 focus-visible:border-gray-400 focus-within:ring-0 focus:ring-transparent rounded-lg dark:bg-gray-700"
					/>
					<button
						disabled={flowId === undefined}
						className=" w-[30px] h-[30px] flex items-center justify-center absolute right-[15px] top-[50%] rotate- translate-y-[-50%] bg-blue-500 hover:bg-blue-600 text-white rounded-md active:bg-blue-500 transition-all"
					>
						<Icons.ReplyRightClick />
					</button>
				</div>
			</form>
		</div>
	);
};
export default FlowChatPopup;
