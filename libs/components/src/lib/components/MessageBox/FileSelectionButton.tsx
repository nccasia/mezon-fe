import { referencesActions, useAppDispatch } from '@mezon/store';
import { Icons } from '@mezon/ui';

export type FileSelectionButtonProps = {
	currentClanId: string;
	currentChannelId: string;
};

function FileSelectionButton({ currentClanId, currentChannelId }: FileSelectionButtonProps) {
	const dispatch = useAppDispatch();

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const fileArr = Array.from(e.target.files);
			dispatch(
				referencesActions.setAtachmentAfterUpload({
					channelId: currentChannelId,
					files: fileArr.map((file) => ({
						filename: file.name,
						filetype: file.type,
						size: file.size,
						url: URL.createObjectURL(file)
					}))
				})
			);
			e.target.value = ''; // Reset the input value after processing
		}
	};

	return (
		<label className="pl-2 flex items-center h-11">
			<input id="preview_img" type="file" onChange={handleChange} className="w-full hidden" multiple />
			<div className="flex flex-row h-6 w-6 items-center justify-center ml-2 mb cursor-pointer">
				<Icons.AddCircle className="w-6 h-6 dark:text-textThreadPrimary text-buttonProfile dark:hover:text-textPrimary hover:text-bgPrimary" />
			</div>
		</label>
	);
}

export default FileSelectionButton;
