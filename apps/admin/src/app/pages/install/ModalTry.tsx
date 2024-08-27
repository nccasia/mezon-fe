import { selectAllAccount } from '@mezon/store';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { FooterModal, HeaderModal, ModalAsk } from './ModalAddBot';
import ModalSuccess from './ModalSuccess';

type ModalTryProps = {
	nameApp?: string;
	handleOpenModal?: () => void;
};

const ModalTry = (props: ModalTryProps) => {
	const { nameApp = '', handleOpenModal = () => {} } = props;
	const account = useSelector(selectAllAccount);

	const [openModalSuccess, setOpenModalSuccess] = useState(false);
	const handleModalSuccess = useCallback(() => {
		setOpenModalSuccess(!openModalSuccess);
	}, [openModalSuccess]);

	return !openModalSuccess ? (
		<div className="rounded bg-bgProfileBody max-w-[440px] w-full pt-4 flex flex-col text-center gap-y-2">
			<HeaderModal name={nameApp} userName={account?.user?.username} isModalTry />
			<FooterModal name={nameApp} />
			<ModalAsk handelBack={handleOpenModal} handleOpenModal={handleModalSuccess} />
		</div>
	) : (
		<ModalSuccess name={nameApp} isModalTry />
	);
};

export default ModalTry;
