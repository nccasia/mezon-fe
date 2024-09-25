import { handleUploadFile, useMezon } from '@mezon/transport';
import { Icons } from '@mezon/ui';
import { ChangeEvent, useRef, useState } from 'react';
import { HTMLFieldProps, connectField } from 'uniforms';

type CustomFormFieldProps = HTMLFieldProps<string[], HTMLDivElement>;

const MultiImageUploadField = connectField((props: CustomFormFieldProps) => {
	const { value = [], onChange } = props;
	const { sessionRef, clientRef } = useMezon();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleChooseFiles = async (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const client = clientRef.current;
			const session = sessionRef.current;
			if (!client || !session) {
				setError('Client or session is not initialized');
				return;
			}
			setIsUploading(true);
			setError(null);
			try {
				const newAttachments: string[] = [];
				for (let i = 0; i < e.target.files.length; i++) {
					const file = e.target.files[i];
					const attachment = await handleUploadFile(client, session, '', '', file.name, file);
					if (attachment && attachment.url) {
						newAttachments.push(attachment.url);
					} else {
						console.warn(`Failed to upload file: ${file.name}`);
					}
				}
				onChange([...value, ...newAttachments]);
			} catch (error) {
				console.error('Error uploading files:', error);
				setError('Failed to upload files. Please try again.');
			} finally {
				setIsUploading(false);
			}
		}
	};

	const handleRemoveImage = (index: number) => {
		const newValue = value.filter((_, i) => i !== index);
		onChange(newValue);
	};

	return (
		<div className="MultiImageField mt-2">
			<label className="block text-sm">Upload Images</label>
			<div className="my-1 w-full flex flex-col items-center p-2 gap-4 bg-[#f2f3f5] dark:bg-[#2b2d31] border dark:border-[#4d4f52] rounded-md">
				<input type="file" ref={fileInputRef} hidden onChange={handleChooseFiles} accept="image/*" multiple />
				<div
					className="relative w-full h-12 cursor-pointer flex justify-center items-center bg-bgLightModeThird dark:bg-[#141416] hover:bg-[#c6ccd2] transition-colors duration-200 rounded-md"
					onClick={() => fileInputRef.current?.click()}
				>
					{isUploading ? (
						<p>Uploading...</p>
					) : (
						<>
							<Icons.SelectFileIcon className="w-8 h-8 text-gray-400" />
							<p className="ml-2">Select Images</p>
						</>
					)}
				</div>
				{error && <p className="text-red-500">{error}</p>}
			</div>
			{value.length && (
				<div className="my-1 w-full flex flex-col items-center p-5 gap-4 bg-[#f2f3f5] dark:bg-[#2b2d31] border dark:border-[#4d4f52] rounded-md">
					<div className="grid grid-cols-1 gap-4 w-full">
						{value.map((imageUrl, index) => (
							<div key={index} className="relative">
								<img className="w-full h-32 object-cover rounded-md" src={imageUrl} alt={`Uploaded image ${index + 1}`} />
								<button
									className="absolute top-1 right-1 text-white rounded-full p-1 hover:bg-[#c6ccd2]"
									onClick={() => handleRemoveImage(index)}
								>
									<Icons.CloseIcon className="w-4 h-4" />
								</button>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
});

export default MultiImageUploadField;
