import { Modal } from '@mezon/ui';
type ModalParam = {
    onClose: () => void;
	open: boolean;
}
const ExpiryTimeModal = (pops: ModalParam) => {
	return (
				<Modal
		title=""
		onClose={() => {
			pops.onClose();
		}}
		showModal={pops.open}
		titleConfirm=""
		classSubTitleBox="ml-[0px] mt-[15px] cursor-default"
		borderBottomTitle="border-b "
		>
			<div className='flex flex-col items-center'>
				<p className='text-2xl mt-[5px]'>The invite link is invalid or has expired</p>
				<p className='text-sm mt-[5px]'>Try using a different link to join this clan</p>
				<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-[5px]"
				onClick={()=>{
					pops.onClose()
				}}
				> Got it</button>
			</div>
		</Modal> 
	);
};
export default ExpiryTimeModal