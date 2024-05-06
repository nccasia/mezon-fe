import { useClans, useInvite, useOnClickOutside } from '@mezon/core';
import { ILineMention } from '@mezon/utils';
import { useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGFM from 'remark-gfm';
import ShortUserProfile from '../ShortUserProfile/ShortUserProfile';
import ChannelHashtag from './HashTag';
import PreClass from './PreClass';
import { useModal } from 'react-modal-hook';
import ExpiryTimeModal from '../ExpiryTime';
type MarkdownFormatTextProps = {
	mentions: ILineMention[];
};

const MarkdownFormatText = ({ mentions }: MarkdownFormatTextProps) => {
	const [showProfileUser, setIsShowPanelChannel] = useState(false);
	const [userID, setUserID] = useState('');
	const { usersClan } = useClans();
	const handMention = (tagName: string) => {
		setIsShowPanelChannel(true);
		const username = tagName.slice(1);
		const user = usersClan.find((userClan) => userClan.user?.username === username);
		setUserID(user?.user?.id || '');
	};
	const panelRef = useRef<HTMLDivElement | null>(null);
	const [positionBottom, setPositionBottom] = useState(false);
	const [positionTop, setPositionTop] = useState(0);
	const [positionLeft, setPositionLeft] = useState(0);
	const handleMouseClick = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
		if (event.button === 0) {
			setIsShowPanelChannel(true);
			const clickY = event.clientY;
			const windowHeight = window.innerHeight;
			const distanceToBottom = windowHeight - clickY;
			const windowWidth = window.innerWidth;
			const elementTagName = event.target;
			if (elementTagName instanceof HTMLElement) {
				const positionRight = elementTagName.getBoundingClientRect().right;
				const widthElement = elementTagName.offsetWidth;
				const widthElementShortUserProfileMin = 380;
				const distanceToRight = windowWidth - positionRight;
				if (distanceToRight < widthElementShortUserProfileMin) {
					setPositionLeft(positionRight - widthElement - widthElementShortUserProfileMin);
				} else {
					setPositionLeft(positionRight + 20);
				}
				setPositionTop(clickY - 50);
				setPositionBottom(false);
			}
			const heightElementShortUserProfileMin = 313;
			if (distanceToBottom < heightElementShortUserProfileMin) {
				setPositionBottom(true);
			}
		}
	};
	useOnClickOutside(panelRef, () => setIsShowPanelChannel(false));

	const handleDefault = (e: any) => {
		e.stopPropagation();
	};
	const { getLinkInvite } = useInvite();
	const [openInviteChannelModal, closeInviteChannelModal] = useModal(() => (
		<ExpiryTimeModal onClose={closeInviteChannelModal} open={true} />
	));
	const getLinkinvite = (children:any) => {
		const inviteId = children.split('/invite/')[1];
		if (inviteId) {
			getLinkInvite(inviteId).then((res) => {
				if (res.expiry_time) {
					if (new Date(res.expiry_time) < new Date()) {
						openInviteChannelModal();
					}else{
						window.location.href = children;
					}
				}
			})
		}else{
			window.open(children, '_blank');
		}
	}
	return (
		<article className="prose-code:text-sm prose-hr:my-0 prose-headings:my-0 prose-headings:contents prose-h1:prose-2xl whitespace-pre-wrap prose prose-base prose-blockquote:leading-[6px] prose-blockquote:my-0">
			{showProfileUser ? (
				<div
					className="bg-black mt-[10px] w-[360px] rounded-lg flex flex-col z-10 fixed opacity-100"
					style={{
						left: `${positionLeft}px`,
						top: positionBottom ? '' : `${positionTop}px`,
						bottom: positionBottom ? '64px' : '',
					}}
					onMouseDown={handleDefault}
				>
					<ShortUserProfile userID={userID} />
				</div>
			) : null}
			{mentions.map((part, index) => {
				const tagName = part.matchedText;
				const markdown = (part.nonMatchText && part.nonMatchText.trim()) ?? '';
				const startsWithTripleBackticks = markdown.startsWith('```');
				const endsWithNoTripleBackticks = !markdown.endsWith('```');
				const onlyBackticks = /^```$/.test(markdown);

				return (
					<div key={index} className="lineText contents">
						{(startsWithTripleBackticks && endsWithNoTripleBackticks) || onlyBackticks ? (
							<span>{markdown}</span>
						) : (
							<Markdown
								children={markdown}
								remarkPlugins={[remarkGFM]}
								components={{
									pre: PreClass,
									p: 'span',
									a: ({ children }) => (
										<span
											onClick={()=>getLinkinvite(children)}
											rel="noopener noreferrer"
											style={{ color: 'rgb(59,130,246)',cursor: 'pointer' }}
											className="tagLink"
										>
											{children}
										</span>
									),
								}}
							/>
						)}
						{markdown && ' '}
						{tagName && (
							<span
								style={{ borderRadius: '4px', padding: '0 2px' }}
								className="font-medium cursor-pointer whitespace-nowrap !text-[#3297ff] hover:!text-white bg-[#3C4270] hover:bg-[#5865F2]"
								onClick={() => handMention(tagName)}
								ref={panelRef}
								onMouseDown={(event) => handleMouseClick(event)}
							>
								{tagName.startsWith('#') ? <ChannelHashtag tagName={tagName} /> : tagName}
							</span>
						)}{' '}
					</div>
				);
			})}
		</article>
	);
};

export default MarkdownFormatText;
