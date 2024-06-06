import { Button } from 'flowbite-react';

type ModalSaveChangesProps = {
	onSave: () => void;
	onReset: () => void;
};

const ModalSaveChanges = ({ onSave, onReset }: ModalSaveChangesProps) => {
	return (
		<div className="w-fit min-w-[700px] fixed bottom-[20px] left-[50%] translate-x-[-50%] py-[10px] pl-4 pr-[10px] rounded-[5px] dark:bg-bgProfileBody bg-white border border-gray-200 dark:border-none" style={{boxShadow : "0 2px 10px 0 hsl(0 calc( 1 * 0%) 0% / 0.1)"}}>
			<div className="flex flex-row justify-between items-center">
				<h3 className="text-base font-medium text-textLightTheme dark:text-textDarkTheme">Careful — you have unsaved changes!</h3>
				<div className="flex flex-row justify-end gap-[10px]">
					<Button
						onClick={onReset}
						className="h-10 w-fit rounded bg-transparent border border-buttonProfile hover:!bg-bgLightModeButton dark:bg-transparent dark:hover:!bg-buttonProfile focus:!ring-transparent text-textLightTheme dark:text-textDarkTheme"
					>
						Reset
					</Button>
					<Button
						onClick={onSave}
						className="h-10 w-fit rounded bg-bgSelectItem hover:!bg-bgSelectItemHover border border-buttonProfile dark:bg-bgSelectItem dark:hover:!bg-bgSelectItemHover focus:!ring-transparent"
					>
						Save Changes
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ModalSaveChanges;
