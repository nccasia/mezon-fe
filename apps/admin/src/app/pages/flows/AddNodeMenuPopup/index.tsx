import { Accordion, CustomFlowbiteTheme } from 'flowbite-react';
import MenuItem from './MenuItem';

interface AddNodeMenuPopupProps {
	onAddNode?: (nodeType: string) => void;
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

const AddNodeMenuPopup = ({ onAddNode }: AddNodeMenuPopupProps) => {
	return (
		<div className="text-sm text-gray-500 dark:text-gray-400 w-[350px]">
			<div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
				<h3 id="default-popover" className="font-semibold text-gray-900 dark:text-white select-none">
					Add Node
				</h3>
			</div>
			<div className="p-2 max-h-[400px] overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:[width:3px] [&::-webkit-scrollbar-thumb]:bg-red-500 transition-all">
				<Accordion collapseAll theme={customTheme}>
					<Accordion.Panel theme={customTheme}>
						<Accordion.Title theme={customTheme.title}>Agents</Accordion.Title>
						<Accordion.Content theme={customTheme.content}>
							<MenuItem
								imageUrl="https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg"
								title="ChatOpenAI"
								description="Wrapper around OpenAI large language model that use the Chat endpoint"
							/>
							<MenuItem
								imageUrl="https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg"
								title="ChatOpenAI"
								description="Wrapper around OpenAI large language model that use the Chat endpoint"
							/>
							<MenuItem
								imageUrl="https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg"
								title="ChatOpenAI"
								description="Wrapper around OpenAI large language model that use the Chat endpoint"
							/>
							<MenuItem
								imageUrl="https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg"
								title="ChatOpenAI"
								description="Wrapper around OpenAI large language model that use the Chat endpoint"
							/>
						</Accordion.Content>
					</Accordion.Panel>
					<Accordion.Panel theme={customTheme}>
						<Accordion.Title theme={customTheme.title}>Cache</Accordion.Title>
						<Accordion.Content theme={customTheme.content}>
							<MenuItem
								imageUrl="https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg"
								title="ChatOpenAI"
								description="Wrapper around OpenAI large language model that use the Chat endpoint"
							/>
							<MenuItem
								imageUrl="https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg"
								title="ChatOpenAI"
								description="Wrapper around OpenAI large language model that use the Chat endpoint"
							/>
							<MenuItem
								imageUrl="https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg"
								title="ChatOpenAI"
								description="Wrapper around OpenAI large language model that use the Chat endpoint"
							/>
							<MenuItem
								imageUrl="https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg"
								title="ChatOpenAI"
								description="Wrapper around OpenAI large language model that use the Chat endpoint"
							/>
						</Accordion.Content>
					</Accordion.Panel>
					<Accordion.Panel theme={customTheme}>
						<Accordion.Title theme={customTheme.title}>Chains</Accordion.Title>
						<Accordion.Content theme={customTheme.content}>
							<MenuItem
								imageUrl="https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg"
								title="ChatOpenAI"
								description="Wrapper around OpenAI large language model that use the Chat endpoint"
							/>
							<MenuItem
								imageUrl="https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg"
								title="ChatOpenAI"
								description="Wrapper around OpenAI large language model that use the Chat endpoint"
							/>
							<MenuItem
								imageUrl="https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg"
								title="ChatOpenAI"
								description="Wrapper around OpenAI large language model that use the Chat endpoint"
							/>
							<MenuItem
								imageUrl="https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg"
								title="ChatOpenAI"
								description="Wrapper around OpenAI large language model that use the Chat endpoint"
							/>
						</Accordion.Content>
					</Accordion.Panel>
					<Accordion.Panel theme={customTheme}>
						<Accordion.Title theme={customTheme.title}>Chat Models</Accordion.Title>
						<Accordion.Content theme={customTheme.content}>
							<p className="mb-2 text-gray-500 dark:text-gray-400">
								Flowbite is an open-source library of interactive components built on top of Tailwind CSS including buttons,
								dropdowns, modals, navbars, and more.
							</p>
						</Accordion.Content>
					</Accordion.Panel>
				</Accordion>
			</div>
		</div>
	);
};
export default AddNodeMenuPopup;
