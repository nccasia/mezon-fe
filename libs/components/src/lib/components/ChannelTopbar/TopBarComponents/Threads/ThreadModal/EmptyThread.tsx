import { Button } from 'flowbite-react';

type EmptyThreadProps = {
	onClick: () => void;
};

const EmptyThread = ({ onClick }: EmptyThreadProps) => {
	const handleCreateThread = () => {
		onClick();
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-[400px] p-12">
			<h2 className="text-2xl text-gray-100 font-semibold mb-2">There are no threads.</h2>
			<p className="text-base text-gray-300 text-center">Stay focused on a conversation with a thread - a temporary text channel.</p>
			<Button
				onClick={handleCreateThread}
				size="sm"
				className="mt-6 h-10 font-medium text-sm rounded focus:ring-transparent bg-primaryButton hover:!bg-[#0040C1]"
			>
				Create Thread
			</Button>
		</div>
	);
};

export default EmptyThread;
