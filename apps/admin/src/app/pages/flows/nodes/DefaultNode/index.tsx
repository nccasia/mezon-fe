// DefaultNode.js
import { Handle, Position } from '@xyflow/react';

interface DefaultNodeProps {
	data: {
		label: string;
	};
}

const DefaultNode = ({ data }: DefaultNodeProps) => {
	return (
		<div className="w-[250px] border-2 rounded-lg bg-slate-50 dark:bg-gray-600">
			<div className="p-2 flex">
				<div className="w-[30px] h-[30px] bg-gray-200 rounded-full items-center">
					<img
						src="https://static.vecteezy.com/system/resources/previews/022/095/996/non_2x/command-button-icon-isolated-on-white-background-vector.jpg"
						alt=""
						className="w-[30px] h-[30px] rounded-full"
					/>
				</div>
				<span className="ml-2 font-medium flex items-center">Default node</span>
			</div>
			<div className="mt-1">
				<div className="font-medium  bg-gray-100 dark:bg-gray-700 text-center p-2 ">Inputs</div>
				<div className="p-2">
					<div className="flex">
						<span className="text-sm">example input 1 </span>
						<span className="text-red-600 ml-2">*</span>
					</div>
					<div className="mt-2">
						<label htmlFor="command" className="text-sm">
							Input
						</label>
						<input
							type="text"
							id="command"
							className="w-full px-2 py-[6px] border-[1px] focus:border-[1px] focus:border-gray-500 focus-visible:border-0 focus:ring-0 focus-within:ring-0 focus:ring-transparent rounded-lg"
						/>
					</div>
				</div>
			</div>
			<div className="mt-1">
				<div className="font-medium  bg-gray-100 dark:bg-gray-700 text-center p-2 ">Outputs</div>
				<div className="p-2">
					<div className="flex justify-end">
						<span className="text-sm">ComandOutput</span>
					</div>
				</div>
			</div>
			<Handle type="source" id="input-1" position={Position.Left} className="bg-gray-700 absolute top-[110px] w-[10px] h-[10px]" />
			<Handle type="target" id="output" position={Position.Right} className="bg-gray-700 absolute top-auto bottom-[12px] w-[10px] h-[10px]" />
		</div>
	);
};

export default DefaultNode;
