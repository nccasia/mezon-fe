import { AvatarImage, Icons, getColorAverageFromURL } from '@mezon/components';
import {
	selectMemberClanByGoogleId,
	selectMemberClanByUserId,
	selectStatusStream,
	useAppDispatch,
	useAppSelector,
	videoStreamActions
} from '@mezon/store';
import { NameComponent } from '@mezon/ui';
import { IChannelMember, IStreamInfo, getAvatarForPrioritize, getNameForPrioritize } from '@mezon/utils';
import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

interface MediaPlayerProps {
	src: string;
}

function HLSPlayer({ src }: MediaPlayerProps) {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const isPlaying = useSelector(selectStatusStream);
	const [isLoading, setIsLoading] = useState(true);
	const [isMuted, setIsMuted] = useState(false);

	useEffect(() => {
		const videoElement = videoRef.current;
		let hls: Hls | null = null;
		let retryCount = 0;
		const maxRetries = 10;

		if (isPlaying && videoElement) {
			if (Hls.isSupported()) {
				hls = new Hls({
					lowLatencyMode: true,
					enableWorker: true,
					maxBufferLength: 30,
					maxBufferSize: 60 * 1000 * 1000
				});

				hls.on(Hls.Events.ERROR, (event, data) => {
					if (data.fatal && hls) {
						switch (data.type) {
							case Hls.ErrorTypes.NETWORK_ERROR:
								if (retryCount < maxRetries) {
									retryCount++;
									setTimeout(() => {
										if (hls) {
											hls.loadSource(src);
											hls.attachMedia(videoElement);
										}
									}, 2000);
								} else {
									setIsLoading(false);
								}
								break;
							case Hls.ErrorTypes.MEDIA_ERROR:
								if (hls) {
									hls.recoverMediaError();
								}
								break;
							default:
								if (hls) {
									hls.destroy();
								}
								break;
						}
					}

					if (data.fatal && data.type === Hls.ErrorTypes.MEDIA_ERROR) {
						videoElement.pause();
						setIsLoading(true);
					}
				});

				hls.loadSource(src);
				hls.attachMedia(videoElement);
				hls.on(Hls.Events.MANIFEST_PARSED, () => {
					videoElement.play().catch((error) => {
						// Check if the video is muted due to autoplay restrictions
						if (error.name === 'NotAllowedError') {
							setIsMuted(true);
							videoElement.muted = true; // Muted if autoplay is blocked
						}
					});
					setIsLoading(false);
				});
			} else {
				videoElement.src = src;
				videoElement.addEventListener('loadedmetadata', () => {
					videoElement.play().catch((error) => {
						if (error.name === 'NotAllowedError') {
							setIsMuted(true);
							videoElement.muted = true; // Muted if autoplay is blocked
						}
					});
					setIsLoading(false);
				});
			}
		}

		return () => {
			if (hls) {
				hls.destroy();
			}
		};
	}, [isPlaying, src]);

	const handleToggleMute = () => {
		const videoElement = videoRef.current;
		if (videoElement) {
			videoElement.muted = !videoElement.muted;
			setIsMuted(videoElement.muted);
		}
	};

	return (
		<div style={{ position: 'relative', width: '100%' }}>
			<video
				ref={videoRef}
				autoPlay
				playsInline
				controls={false}
				style={{ width: '100%' }}
				controlsList="nodownload noremoteplayback noplaybackrate"
				disablePictureInPicture
			/>
			{isLoading && (
				<div className="absolute top-0 left-0 w-full h-full bg-black flex justify-center items-center text-white text-xl z-50">
					Loading...
				</div>
			)}
			{isMuted && (
				<button onClick={handleToggleMute} className="absolute bottom-5 left-5 bg-gray-800 text-white px-4 py-2 rounded">
					Turn on sound
				</button>
			)}
		</div>
	);
}

export type UserListStreamChannelProps = {
	readonly memberJoin: IChannelMember[];
};

function UserListStreamChannel({ memberJoin }: UserListStreamChannelProps) {
	const [displayedMembers, setDisplayedMembers] = useState<IChannelMember[]>(memberJoin || []);

	useEffect(() => {
		const handleSizeWidth = () => {
			let membersToShow = memberJoin || [];
			if (window.innerWidth < 900) {
				membersToShow = membersToShow.slice(0, 4);
			} else if (window.innerWidth < 1000) {
				membersToShow = membersToShow.slice(0, 5);
			} else if (window.innerWidth < 1200) {
				membersToShow = membersToShow.slice(0, 6);
			} else if (window.innerWidth > 1200) {
				membersToShow = membersToShow.slice(0, 8);
			}
			setDisplayedMembers(membersToShow);
		};

		handleSizeWidth();
		window.addEventListener('resize', handleSizeWidth);

		return () => {
			window.removeEventListener('resize', handleSizeWidth);
		};
	}, [memberJoin]);

	return displayedMembers.map((item: IChannelMember) => (
		<div key={item.id} className="w-[250px] h-[100px] min-w-[100px] min-h-[100px]">
			<UserItem user={item} />
		</div>
	));
}

function UserItem({ user }: { user: IChannelMember }) {
	const member = useSelector(selectMemberClanByGoogleId(user.user_id ?? ''));
	const userStream = useAppSelector(selectMemberClanByUserId(user.user_id ?? ''));
	const clanNick = member ? member?.clan_nick : userStream?.clan_nick;
	const displayName = member ? member?.user?.display_name : userStream?.user?.display_name;
	const userName = member ? member?.user?.username : userStream?.user?.username;
	const name = getNameForPrioritize(clanNick, displayName, userName);
	const clanAvatar = member ? member?.clan_avatar : userStream?.clan_avatar;
	const avatarUrl = member ? member?.user?.avatar_url : userStream?.user?.avatar_url;
	const avatar = getAvatarForPrioritize(clanAvatar, avatarUrl);

	const checkUrl = (url: string | undefined) => url !== undefined && url !== '';

	const [color, setColor] = useState<string>('');

	useEffect(() => {
		const getColor = async () => {
			if (checkUrl(avatarUrl)) {
				const colorImg = await getColorAverageFromURL(avatarUrl || '');
				if (colorImg) setColor(colorImg);
			}
		};

		getColor();
	}, [avatarUrl]);

	return (
		<div
			className="relative w-full h-full flex p-1 justify-center items-center gap-3 cursor-pointer rounded-lg"
			style={{ backgroundColor: color || 'grey' }}
		>
			<div className="w-14 h-14 rounded-full">
				<div className="w-14 h-14">
					{member || userStream ? (
						<AvatarImage alt={userName || ''} userName={userName} className="min-w-14 min-h-14 max-w-14 max-h-14" src={avatar} />
					) : (
						<Icons.AvatarUser />
					)}
				</div>
			</div>
			<div className="absolute left-1 bottom-1">
				{member || userStream ? (
					<NameComponent id="" name={name || ''} />
				) : (
					<p className="text-sm font-medium dark:text-[#AEAEAE] text-colorTextLightMode">{user.participant}</p>
				)}
			</div>
		</div>
	);
}

type ChannelStreamProps = {
	hlsUrl?: string;
	memberJoin: IChannelMember[];
	currentStreamInfo: IStreamInfo | null;
	channelName?: string;
};

export default function ChannelStream({ hlsUrl, memberJoin, currentStreamInfo, channelName }: ChannelStreamProps) {
	const [showScreenJoin, setShowScreenJoin] = useState(false);
	const dispatch = useAppDispatch();

	const handleLeaveChannel = async () => {
		if (currentStreamInfo) {
			dispatch(videoStreamActions.stopStream());
		}
		// dispatch(usersStreamActions.remove(userProfile?.user?.id || ''));
		setShowScreenJoin(true);
	};

	const handleJoinChannel = async () => {
		// dispatch(usersStreamActions.add({}));
		dispatch(videoStreamActions.startStream(currentStreamInfo as IStreamInfo));
		setShowScreenJoin(false);
	};

	return showScreenJoin ? (
		<div className="w-full h-full bg-black flex justify-center items-center">
			<div className="flex flex-col justify-center items-center gap-4">
				{memberJoin.length > 0 && <UserListStreamChannel memberJoin={memberJoin}></UserListStreamChannel>}
				<div className="text-3xl font-bold">{channelName}</div>
				{memberJoin.length ? <div>Everyone is waiting for you inside</div> : <div>No one is currently in stream</div>}
				<button className="bg-green-700 rounded-3xl p-2" onClick={handleJoinChannel}>
					Join stream
				</button>
			</div>
		</div>
	) : (
		<div className="w-full flex flex-col gap-6">
			{hlsUrl ? (
				<div className="min-h-40 items-center flex justify-center">
					<div className="w-9/12">
						<HLSPlayer src={hlsUrl} />
					</div>
				</div>
			) : (
				<div className="bg-white min-h-[500px] text-5xl text-black flex justify-center items-center">No stream today</div>
			)}
			<div className="w-full flex gap-2 justify-center">
				<UserListStreamChannel memberJoin={memberJoin}></UserListStreamChannel>
			</div>
			<div className="flex justify-center items-center">
				<button onClick={handleLeaveChannel} className="bg-red-600 flex justify-center items-center rounded-full p-3">
					<Icons.EndCall defaultSize="w-6 h-6" />
				</button>
			</div>
		</div>
	);
}
