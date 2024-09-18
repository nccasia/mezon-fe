import { connectField, HTMLFieldProps } from 'uniforms';
// CommandOutputNode.js
import { handleUploadFile, useMezon } from '@mezon/transport';
import { Icons } from '@mezon/ui';

import { ApiMessageAttachment } from 'mezon-js/api.gen';
import { ChangeEvent, useRef } from 'react';
type CustomFormFieldProps = HTMLFieldProps<string, HTMLDivElement>;
const ImageUploadField = connectField((props: CustomFormFieldProps) => {
	const { value, onChange } = props;
	const { sessionRef, clientRef } = useMezon();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleChooseFile = async (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const client = clientRef.current;
			const session = sessionRef.current;
			if (!client || !session) {
				throw new Error('Client or file is not initialized');
			}
			try {
				const attachment: ApiMessageAttachment = await handleUploadFile(client, session, '', '', e.target.files[0].name, e.target.files[0]);
				onChange(attachment.url);
			} catch (error) {
				console.error('Error uploading file:', error);
			}
		}
	};

	const handleClearImage = () => {
		onChange('');
	};

	return (
		<div className="ImageField mt-2">
			<label className="block text-sm">Upload Image</label>
			<div className=" my-1 w-full flex flex-col items-center p-5 gap-1 bg-[#f2f3f5] dark:bg-[#2b2d31] border dark:border-[#4d4f52] rounded-md">
				<input type="file" ref={fileInputRef} hidden onChange={handleChooseFile} accept="image/*" />
				<div className="relative width: '200px', height: '100px'  cursor-pointer" onClick={() => fileInputRef.current?.click()}>
					{value ? (
						<img
							className="w-full h-full object-cover hover:opacity-80 transition-opacity duration-200"
							style={{ borderRadius: '12px', maxWidth: '200px', maxHeight: '200px' }}
							src={value}
							alt="Gif"
						/>
					) : (
						<div
							className="w-full h-full flex justify-center items-center bg-bgLightModeThird dark:bg-[#141416] hover:bg-[#c6ccd2] transition-colors duration-200"
							style={{ borderRadius: '12px', width: '200px', height: '100px' }}
						>
							<Icons.SelectFileIcon className="w-8 h-8 text-gray-400" />
						</div>
					)}
					<div className="absolute right-[-5px] top-[-5px] p-[8px] bg-[#e3e5e8] rounded-full z-10 shadow-xl border">
						<Icons.SelectFileIcon className="w-6 h-6" />
					</div>
				</div>
				{value && (
					<div className="text-blue-600 mb-[-5px] mt-2 cursor-pointer hover:underline" onClick={handleClearImage}>
						Remove
					</div>
				)}
			</div>
		</div>
	);
});
export default ImageUploadField;
