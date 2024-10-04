import { RootState } from '@mezon/store';
import { Loading } from '@mezon/ui';
import { useSelector } from 'react-redux';

interface CreateChannelProps {
	checkInputError: boolean | undefined;
	onClickCancel: () => void;
	onClickCreate: () => void;
}

export const CreateChannelButton: React.FC<CreateChannelProps> = ({ checkInputError, onClickCancel, onClickCreate }) => {
	const isLoading = useSelector((state: RootState) => state.channels.loadingStatus);
	return (
		<div
			className="Frame394 absolute border-t border-solid dark:border-borderDefault self-stretch mb-0 pt-3 justify-end items-center gap-4 inline-flex bottom-5 right-5"
			style={{
				width: 'calc(100% - 40px)'
			}}
		>
			<button onClick={onClickCancel} className="Text dark:text-white text-black hover:underline text-xs leading-normal font-semibold">
				Cancel
			</button>

			<button
				disabled={isLoading === 'loading'}
				onClick={onClickCreate}
				className={`Text disabled:cursor-not-allowed text-xs leading-normal relative h-10 w-30 justify-center px-3 py-3 flex flex-row items-center gap-1 font-semibold rounded bg-blue-600 ${!(checkInputError === false) ? 'dark:text-slate-400 text-colorTextLightMode bg-opacity-50' : 'hover:bg-blue-500 text-white'}`}
			>
				{isLoading === 'loading' ? (
					<>
						<Loading /> <span>Creating</span>
					</>
				) : (
					<span>Create Channel</span>
				)}
			</button>
		</div>
	);
};
