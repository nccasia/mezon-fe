import { INodeType } from '../../../stores/flow/flow.interface';
import MenuItem from './MenuItem';

interface INodeMenu {
	title: string;
	nodeType: INodeType;
	description: string;
	imageUrl: string;
}
const AddNodeMenuPopup = () => {
	const nodeMenu: INodeMenu[] = [
		{
			title: 'Command Input',
			nodeType: 'commandInput',
			description: 'Wrapper around OpenAI large language model that use the Chat endpoint',
			imageUrl:
				'https://static.vecteezy.com/system/resources/previews/022/095/996/non_2x/command-button-icon-isolated-on-white-background-vector.jpg'
		},
		{
			title: 'Command Output',
			nodeType: 'uploadedImage',
			description: 'Wrapper around OpenAI large language model that use the Chat endpoint',
			imageUrl:
				'https://static.vecteezy.com/system/resources/previews/022/095/996/non_2x/command-button-icon-isolated-on-white-background-vector.jpg'
		},
		{
			title: 'Format Function',
			nodeType: 'formatFunction',
			description: 'Wrapper around OpenAI large language model that use the Chat endpoint',
			imageUrl:
				'https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg'
		},
		{
			title: 'API Loader',
			nodeType: 'apiLoader',
			description: 'Wrapper around OpenAI large language model that use the Chat endpoint',
			imageUrl:
				'https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg'
		}
	];
	return (
		<div className="text-sm text-gray-500 dark:text-gray-400 w-[350px]">
			<div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
				<h3 id="default-popover" className="font-semibold text-gray-900 dark:text-white select-none">
					Add Node
				</h3>
			</div>
			<div className="p-2 max-h-[400px] overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:[width:3px] [&::-webkit-scrollbar-thumb]:bg-red-500 transition-all">
				{nodeMenu.map((node, index) => (
					<MenuItem key={index} nodeType={node.nodeType} imageUrl={node.imageUrl} title={node.title} description={node.description} />
				))}
			</div>
		</div>
	);
};
export default AddNodeMenuPopup;
