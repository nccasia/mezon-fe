import { useEscapeKey } from '@mezon/core';
import DocumentThumbnail from './DocumentThumbnail';

interface ITooManyUploadProps {
	togglePopup: () => void;
}

const TooManyUpload = ({ togglePopup }: ITooManyUploadProps) => {
	useEscapeKey(togglePopup);
	return (
		<div className="w-screen h-screen flex justify-center items-center fixed top-0 left-0 z-30">
			<div className="fixed inset-0 bg-black opacity-80" onClick={togglePopup} />
			<div className="w-[25rem] h-[15rem] bg-red-500 flex flex-row justify-center  items-center rounded-lg z-50 relative">
				<div className=" absolute z-50 -top-12">
					<DocumentThumbnail />
				</div>
				<div className="border-2 border-white w-[90%] h-[86%] rounded-lg border-dashed">
					<div className="flex flex-col justify-center mt-14">
						<div className=" w-full flex flex-row justify-center">
							<h1 className=" font-bold text-2xl mt-[1rem] text-center">Too many uploads!</h1>
						</div>
						<div className=" w-full flex flex-row justify-center text-center mt-[1rem]">
							<p className="w-[85%]">You can only upload 10 files at a time!</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TooManyUpload;
