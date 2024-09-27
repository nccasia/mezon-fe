import { useChannelRestriction } from '@mezon/core';
import { selectCurrentChannelId } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { EOverriddenPermission } from '@mezon/utils';
import { Button } from 'flowbite-react';
import { useSelector } from 'react-redux';

type EmptyThreadProps = {
	onClick: () => void;
};

const EmptyThread = ({ onClick }: EmptyThreadProps) => {
	const currentChannelId = useSelector(selectCurrentChannelId);
	const { maxChannelPermissions } = useChannelRestriction(currentChannelId ?? '');
	const handleCreateThread = () => {
		onClick();
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-[400px] p-12">
			<button className="relative mx-auto mb-4 p-[22px] rounded-full dark:bg-bgPrimary bg-bgLightPrimary cursor-default">
				<Icons.ThreadEmpty className="w-9 h-9 dark:bg-bgPrimary bg-bgLightPrimary dark:text-bgIconDark text-bgIconLight" />
				<Icons.EmptyUnreadStyle className="w-[104px] h-[80px] absolute top-0 left-[-10px]" />
			</button>
			<h2 className="text-2xl dark:text-gray-100 text-bgPrimary font-semibold mb-2">There are no threads.</h2>
			<p className="text-base dark:text-gray-300 text-textSecondary800 text-center">
				Stay focused on a conversation with a thread - a temporary text channel.
			</p>
			{maxChannelPermissions[EOverriddenPermission.manageThread] && (
				<Button
					onClick={handleCreateThread}
					size="sm"
					className="mt-6 h-10 font-medium text-sm rounded focus:ring-transparent bg-bgSelectItem dark:bg-bgSelectItem hover:!bg-bgSelectItemHover"
				>
					Create Thread
				</Button>
			)}
		</div>
	);
};

export default EmptyThread;
