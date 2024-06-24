import { useEscapeKey, useInvite } from '@mezon/core';
import { useEffect, useState } from 'react';
import ListMemberInvite from '.';
import Modal from '../../../../../ui/src/lib/Modal';
import { useSelector } from 'react-redux';
import { selectChannelById, selectCurrentClan, selectCurrentClanId } from '@mezon/store';

const expireAfter = [
	'30 minutes',
	'1 hour',
	'6 hours',
	'12 hours',
	'1 day',
	'7 day',
	'Never',
];

const maxNumberofUses= [
	'No limit',
	'1 use',
	'5 uses',
	'10 uses',
	'25 uses',
	'50 uses',
	'100 uses',
]

export type ModalParam = {
	onClose: () => void;
	open: boolean;
	// url:string;
	channelID: string;
	confirmButton?: () => void;
};

const ModalInvite = (props: ModalParam) => {
	const [expire, setExpire] = useState('7 day');
	const [max, setMax] = useState('No limit');
	const [modalEdit, setModalEdit] = useState(false);
	const [urlInvite, setUrlInvite] = useState('');
	const currentClanId = useSelector(selectCurrentClanId);
	const { createLinkInviteUser } = useInvite();

	const { onClose, channelID } = props;
	const channel = useSelector(selectChannelById(channelID));
	const clan = useSelector(selectCurrentClan);

	const handleOpenInvite = () => {
		createLinkInviteUser(currentClanId ?? '', props.channelID ?? '', 10).then((res) => {
			if (res && res?.invite_link) {
				setUrlInvite(window.location.origin + '/invite/' + res.invite_link);
			}
		});
	};

	useEffect(() => {
		handleOpenInvite();
	}, []);

	useEscapeKey(onClose);

	const unsecuredCopyToClipboard = (text: string) => {
		const textArea = document.createElement('textarea');
		textArea.value = text;
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		try {
			document.execCommand('copy');
		} catch (err) {
			console.error('Unable to copy to clipboard', err);
		}
		document.body.removeChild(textArea);
	};

	const handleCopyToClipboard = (content: string) => {
		if (window.isSecureContext && navigator.clipboard) {
			navigator.clipboard.writeText(content);
		} else {
			unsecuredCopyToClipboard(content);
		}
	};

	const closeModalEdit = () => setModalEdit(false);
	return (
		!modalEdit ?
		(<Modal
			title={`Invite friends to ${clan?.clan_name}`}
			onClose={() => {
				props.onClose();
			}}
			showModal={props.open}
			confirmButton={() => handleCopyToClipboard(urlInvite)}
			titleConfirm="Copy"
			hasChannel={channel}
			classSubTitleBox="ml-[0px] cursor-default"
			borderBottomTitle="border-b "
		>
			<div>
				<ListMemberInvite url={urlInvite} channelID={props.channelID} />
				<div className="relative ">
					<p className="pt-4 pb-1 text-[20px] mb-12px cursor-default">
						<span>Or, send a clan invite link to a friend</span>
					</p>
					<input
						type="text"
						className="w-full h-11 border border-solid border-black dark:bg-black bg-bgLightModeSecond rounded-[5px] px-[16px] py-[13px] text-[14px] "
						value={urlInvite}
						readOnly
					/>
					<button
						className="absolute right-0 bottom-0 mb-1 text-white font-semibold text-sm px-8 py-1.5
        shadow hover:text-fuchsia-500 outline-none focus:outline-none ease-linear transition-all duration-150
        bg-primary text-[16px] leading-6 rounded mr-[8px]"
						onClick={() => {
							handleCopyToClipboard(urlInvite);
							onClose();
						}}
					>
						Copy
					</button>
				</div>
				<p className="pt-1 text-[14px] mb-12px text-[#AEAEAE] inline-flex gap-x-2">
					<span className="cursor-default dark:text-white text-black">Your invite link expires in {expire} </span>
					<span className="text-blue-300 cursor-pointer hover:underline" onClick={()=>setModalEdit(true)}>
						Edit invite link.
					</span>
				</p>
			</div>
		</Modal>) : 
		(<Modal 
			title='Clan invite link settings' 
			onClose={closeModalEdit}
			showModal={modalEdit}
			classNameWrapperChild='space-y-5'
			classNameBox='max-w-[440px]'
		>
			<div className='space-y-2'>
				<h3 className="text-xs font-bold dark:text-textSecondary text-textSecondary800 uppercase">Expire After</h3>
				<select
					name="expireAfter"
					className="block w-full dark:bg-black bg-bgModifierHoverLight dark:text-white text-black border dark:border-black rounded p-2 font-normal text-sm tracking-wide outline-none border-none"
					onChange={(e) => {setExpire(e.target.value)}}
					value={expire}
				>
					{expireAfter.map((item) => (
						<option key={item} value={item}>
							{item}
						</option>
					))}
				</select>
			</div>
			<div className='space-y-2'>
				<h3 className="text-xs font-bold dark:text-textSecondary text-textSecondary800 uppercase">Max Number of Uses</h3>
				<select
					name="maxNumberofUses"
					className="block w-full dark:bg-black bg-bgModifierHoverLight dark:text-white text-black border dark:border-black rounded p-2 font-normal text-sm tracking-wide outline-none border-none"
					onChange={(e) => {setMax(e.target.value)}}
					value={max}
				>
					{maxNumberofUses.map((item) => (
						<option key={item} value={item}>
							{item}
						</option>
					))}
				</select>
			</div>
			<div className='flex justify-end gap-x-4'>
				<button className='px-4 py-2 rounded bg-slate-500 hover:bg-opacity-85' onClick={closeModalEdit}>Cancel</button>
				<button className='px-4 py-2 rounded bg-primary hover:bg-opacity-85' onClick={closeModalEdit}>Generate a New Link</button>
			</div>
		</Modal>)
	);
};
export default ModalInvite;
