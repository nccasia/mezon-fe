import { useFriends } from '@mezon/core';
import { ChannelMembersEntity, selectCurrentUserId, selectTheme, StateFriendProps, useAppSelector } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { IUser } from '@mezon/utils';
import { Tooltip } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { OpenModalProps } from '..';
import { PopupFriend, PopupOption } from './PopupShortUser';

type GroupIconBannerProps = {
	checkAddFriend: StateFriendProps;
	openModal: OpenModalProps;
	user: ChannelMembersEntity | null;
	showPopupLeft?: boolean;
	setOpenModal: React.Dispatch<React.SetStateAction<OpenModalProps>>;
	kichUser?: IUser | null;
};

const GroupIconBanner = (props: GroupIconBannerProps) => {
	const { checkAddFriend, openModal, user, showPopupLeft, setOpenModal, kichUser } = props;
	const appearanceTheme = useSelector(selectTheme);
	const { addFriend, acceptFriend, deleteFriend } = useFriends();
	const currentUserId = useAppSelector(selectCurrentUserId);
	const isSelf = user?.user?.id === currentUserId;

	const handleDefault = (event: any) => {
		event.stopPropagation();
	};

	return (
		<>
			{!isSelf && (
				<>
					{checkAddFriend.friend && (
						<div
							className="p-2 rounded-full bg-buttonMore hover:bg-buttonMoreHover relative h-fit"
							onClick={(e) => {
								handleDefault(e);
								setOpenModal({ openOption: false, openFriend: !openModal.openFriend });
							}}
						>
							<Tooltip
								content="Friend"
								trigger="hover"
								animation="duration-500"
								style={appearanceTheme === 'light' ? 'light' : 'dark'}
								className="whitespace-nowrap"
							>
								<Icons.IconFriend className="iconWhiteImportant size-4" />
							</Tooltip>
							{openModal.openFriend && <PopupFriend user={user} showPopupLeft={showPopupLeft} />}
						</div>
					)}
					{checkAddFriend.noFriend && (
						<div
							className="p-2 rounded-full bg-buttonMore hover:bg-buttonMoreHover relative h-fit"
							onClick={(e) => {
								handleDefault(e);
								if (user) {
									addFriend({
										usernames: [user.user?.username || ''],
										ids: []
									});
								} else {
									if (kichUser) {
										addFriend({
											usernames: [kichUser.username],
											ids: []
										});
									}
								}
							}}
						>
							<Tooltip
								content="Add friend"
								trigger="hover"
								animation="duration-500"
								style={appearanceTheme === 'light' ? 'light' : 'dark'}
								className="whitespace-nowrap"
							>
								<Icons.AddPerson className="iconWhiteImportant size-4" />
							</Tooltip>
						</div>
					)}

					{checkAddFriend.myPendingFriend && showPopupLeft && (
						<>
							<div
								className="p-2 rounded-full bg-[#4e5058] relative h-fit"
								onClick={(e) => {
									handleDefault(e);
									if (user) {
										acceptFriend(user.user?.username || '', user.user?.id || '');
									}
								}}
							>
								<Tooltip
									content="Accept"
									trigger="hover"
									animation="duration-500"
									style={appearanceTheme === 'light' ? 'light' : 'dark'}
									className="whitespace-nowrap"
								>
									<Icons.IConAcceptFriend className="iconWhiteImportant size-4" />
								</Tooltip>
							</div>
							<div
								className="p-2 rounded-full bg-[#4e5058] relative h-fit"
								onClick={(e) => {
									handleDefault(e);
									if (user) {
										deleteFriend(user.user?.username || '', user.user?.id || '');
									}
								}}
							>
								<Tooltip
									content="Ignore"
									trigger="hover"
									animation="duration-500"
									style={appearanceTheme === 'light' ? 'light' : 'dark'}
									className="whitespace-nowrap"
								>
									<Icons.IConIgnoreFriend className="iconWhiteImportant size-4" />
								</Tooltip>
							</div>
						</>
					)}

					{checkAddFriend.otherPendingFriend && (
						<div
							className="p-2 rounded-full bg-[#4e5058] relative h-fit"
							onClick={(e) => {
								handleDefault(e);
							}}
						>
							<Tooltip
								content="Pending"
								trigger="hover"
								animation="duration-500"
								style={appearanceTheme === 'light' ? 'light' : 'dark'}
								className="whitespace-nowrap"
							>
								<Icons.PendingFriend className="iconWhiteImportant size-4" />
							</Tooltip>
						</div>
					)}
				</>
			)}

			<div
				className="p-2 rounded-full bg-buttonMore hover:bg-buttonMoreHover relative h-fit"
				onClick={(e) => {
					handleDefault(e);
					setOpenModal({ openFriend: false, openOption: !openModal.openOption });
				}}
			>
				<Tooltip
					content="More"
					trigger="hover"
					animation="duration-500"
					style={appearanceTheme === 'light' ? 'light' : 'dark'}
					className="whitespace-nowrap"
				>
					<Icons.ThreeDot defaultSize="size-4 iconWhiteImportant" />
				</Tooltip>
				{openModal.openOption && <PopupOption showPopupLeft={showPopupLeft} isSelf={isSelf} />}
			</div>
		</>
	);
};

export default GroupIconBanner;
