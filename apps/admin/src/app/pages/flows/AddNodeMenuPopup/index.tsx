import { Accordion, CustomFlowbiteTheme } from 'flowbite-react';
import MenuItem from './MenuItem';

interface AddNodeMenuPopupProps {
	onChangeNodeType: (nodeType: string) => void;
}

const customTheme: CustomFlowbiteTheme['accordion'] = {
	title: {
		base: 'flex w-full items-center justify-between p-2 text-left font-medium text-gray-500 first:rounded-t-lg last:rounded-b-lg dark:text-gray-400 transition-all',
		flush: {
			off: 'hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-800 dark:focus:ring-gray-800',
			on: 'bg-transparent dark:bg-transparent'
		}
	},
	content: {
		base: 'p-2 first:rounded-t-lg last:rounded-b-lg dark:bg-gray-900 transition-all'
	}
};

const AddNodeMenuPopup = ({ onChangeNodeType }: AddNodeMenuPopupProps) => {
	const nodeMenu = [
		{
			title: 'Command Builder',
			childrens: [
				{
					title: 'Command Input',
					nodeType: 'command',
					description: 'Wrapper around OpenAI large language model that use the Chat endpoint',
					onChangeNodeType: onChangeNodeType,
					imageUrl:
						'https://static.vecteezy.com/system/resources/previews/022/095/996/non_2x/command-button-icon-isolated-on-white-background-vector.jpg'
				},
				{
					title: 'Command Output',
					nodeType: 'defaultCustom',
					description: 'Wrapper around OpenAI large language model that use the Chat endpoint',
					onChangeNodeType: onChangeNodeType,
					imageUrl:
						'https://static.vecteezy.com/system/resources/previews/022/095/996/non_2x/command-button-icon-isolated-on-white-background-vector.jpg'
				},
				{
					title: 'ChatOpenAI',
					nodeType: 'defaultCustom',
					description: 'Wrapper around OpenAI large language model that use the Chat endpoint',
					onChangeNodeType: onChangeNodeType,
					imageUrl:
						'https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg'
				},
				{
					title: 'ChatOpenAI',
					nodeType: 'command',
					description: 'Wrapper around OpenAI large language model that use the Chat endpoint',
					onChangeNodeType: onChangeNodeType,
					imageUrl:
						'https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg'
				}
			]
		},
		{
			title: 'Chat Models',
			childrens: null
		},
		{
			title: 'Chat Models',
			childrens: null
		},
		{
			title: 'Chat Models',
			childrens: null
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
				<Accordion collapseAll theme={customTheme}>
					{nodeMenu.map((item, index) => (
						<Accordion.Panel key={index} theme={customTheme}>
							<Accordion.Title theme={customTheme.title}>{item.title}</Accordion.Title>
							{item.childrens !== null ? (
								<Accordion.Content theme={customTheme.content}>
									{item.childrens?.map((child, index) => (
										<MenuItem
											key={index}
											nodeType={child.nodeType}
											onChangeNodeType={child.onChangeNodeType}
											imageUrl={child.imageUrl}
											title={child.title}
											description={child.description}
										/>
									))}
								</Accordion.Content>
							) : (
								<></>
							)}
						</Accordion.Panel>
					))}
				</Accordion>
			</div>
		</div>
	);
};
export default AddNodeMenuPopup;
