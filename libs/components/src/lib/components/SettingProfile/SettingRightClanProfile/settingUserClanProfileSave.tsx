import { getSelectedRoleId } from '@mezon/store';
import { useSelector } from 'react-redux';

export type ModalSettingSave = {
	flagOption: boolean;
	handleClose: () => void;
	handlSaveClose: () => void;
	handleUpdateUser: () => void;
};
export type PropsModalSettingSave = {
	PropsSave: ModalSettingSave;
};
const SettingUserClanProfileSave = (props: PropsModalSettingSave) => {
	const { PropsSave } = props;
	const clickRole = useSelector(getSelectedRoleId);
	return PropsSave.flagOption || clickRole === 'New Role' ? (
		<div className="flex flex-row gap-2  bg-gray-500 absolute max-w-[815px] w-full left-1/2 translate-x-[-50%] bottom-4 min-w-96 h-fit p-3 rounded transform">
			<div className="flex-1 flex items-center text-nowrap">
				<p className="text-[15px]">Carefull - you have unsaved changes!</p>
			</div>
			<div className="flex flex-row justify-end gap-3">
				<button
					className="text-[15px] bg-gray-600 rounded-[4px] p-[8px]"
					onClick={() => {
						PropsSave.handleClose();
					}}
				>
					Reset
				</button>
				<button
					className="text-[15px] ml-auto bg-blue-600 rounded-[4px] p-[8px] text-nowrap"
					onClick={() => {
						PropsSave.handlSaveClose();
						PropsSave.handleUpdateUser();
					}}
				>
					Save Changes
				</button>
			</div>
		</div>
	) : null;
};
export default SettingUserClanProfileSave;
