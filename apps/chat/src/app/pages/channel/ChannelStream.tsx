import { AvatarImage, getColorAverageFromURL } from '@mezon/components';
import { useAuth } from '@mezon/core';
import {
	selectMemberClanByGoogleId,
	selectMemberClanByUserId,
	selectStatusStream,
	selectTheme,
	useAppDispatch,
	useAppSelector,
	usersStreamActions,
	videoStreamActions
} from '@mezon/store';
import { Icons } from '@mezon/ui';
import { IChannelMember, IStreamInfo, getAvatarForPrioritize, getNameForPrioritize } from '@mezon/utils';
import { Tooltip } from 'flowbite-react';
import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

interface MediaPlayerProps {
	src: string;
}

function HLSPlayer({ src }: MediaPlayerProps) {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const isPlaying = useSelector(selectStatusStream);
	const [isLoading, setIsLoading] = useState(true);
	const [isMuted, setIsMuted] = useState(false);
	const [volume, setVolume] = useState(1);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [mediaError, setMediaError] = useState(false);
	const [showControls, setShowControls] = useState(false);
	const [errorLimitReached, setErrorLimitReached] = useState(false);
	const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		const videoElement = videoRef.current;
		let hls: Hls | null = null;
		let retryCount = 0;
		const maxRetries = 10;
		let mediaErrorRetryCount = 0;
		const maxMediaErrorRetries = 5;

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
									setErrorLimitReached(true);
									setIsLoading(false);
								}
								break;
							case Hls.ErrorTypes.MEDIA_ERROR:
								if (mediaErrorRetryCount < maxMediaErrorRetries) {
									mediaErrorRetryCount++;
									if (!mediaError) {
										setMediaError(true);
										videoElement.pause();
										setIsLoading(true);
										setTimeout(() => {
											hls?.recoverMediaError();
											setMediaError(false);
										}, 3000);
									}
								} else {
									setErrorLimitReached(true);
									setIsLoading(false);
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
						// videoElement.pause();
						setIsLoading(true);
					}
				});

				hls.loadSource(src);
				hls.attachMedia(videoElement);
				hls.on(Hls.Events.MANIFEST_PARSED, () => {
					videoElement.play().catch((error) => {
						if (error.name === 'NotAllowedError') {
							setIsMuted(true);
							videoElement.muted = true;
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
							videoElement.muted = true;
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
	}, [isPlaying, mediaError, src]);

	const handleToggleMute = () => {
		const videoElement = videoRef.current;
		if (videoElement) {
			videoElement.muted = !isMuted;
			setIsMuted(videoElement.muted);
		}
	};

	const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newVolume = parseFloat(event.target.value);
		const videoElement = videoRef.current;
		if (videoElement) {
			videoElement.volume = newVolume;
			setVolume(newVolume);
			if (newVolume > 0) {
				videoElement.muted = false;
				setIsMuted(false);
			} else {
				videoElement.muted = true;
				setIsMuted(true);
			}
		}
	};

	const handleFullscreen = () => {
		const containerElement = containerRef.current;
		if (containerElement) {
			if (!document.fullscreenElement) {
				containerElement
					.requestFullscreen()
					.then(() => {
						setIsFullscreen(true);
					})
					.catch((err) => {
						console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
					});
			} else {
				document.exitFullscreen().then(() => {
					setIsFullscreen(false);
				});
			}
		}
	};

	const handleMouseEnter = () => {
		setShowControls(true);
		resetHideControlsTimer();
	};

	const handleMouseLeave = () => {
		setShowControls(false);
		resetHideControlsTimer();
	};

	const handleMouseMoveOrClick = () => {
		setShowControls(true);
		resetHideControlsTimer();
	};

	const resetHideControlsTimer = () => {
		if (hideControlsTimeoutRef.current) {
			clearTimeout(hideControlsTimeoutRef.current);
		}
		hideControlsTimeoutRef.current = setTimeout(() => {
			setShowControls(false);
		}, 3000);
	};

	return (
		<div
			ref={containerRef}
			className="relative w-full overflow-hidden rounded-lg"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onMouseMove={handleMouseMoveOrClick}
			onClick={handleMouseMoveOrClick}
		>
			<video ref={videoRef} autoPlay playsInline controls={false} className="w-full h-full" />

			{isLoading && (
				<div className="absolute top-0 left-0 w-full h-full bg-black flex justify-center items-center text-white text-xl z-50">
					Loading...
				</div>
			)}
			{errorLimitReached && (
				<div className="absolute top-0 left-0 w-full h-full bg-black flex justify-center items-center text-white text-xl z-50">
					Cannot play video. Please try again later.
				</div>
			)}

			<div
				className={`bg-black bg-opacity-50 absolute bottom-0 flex items-center w-full justify-between p-2 transition-transform duration-300 ease-in-out ${showControls ? 'translate-y-0' : 'translate-y-full'}`}
			>
				<div className="flex items-center gap-1">
					<button onClick={handleToggleMute} className="p-1">
						{isMuted || volume === 0 ? (
							<Icons.MutedVolume className="dark:text-[#AEAEAE] text-[#535353] dark:hover:text-white hover:text-black" />
						) : volume < 0.5 ? (
							<Icons.LowVolume className="dark:text-[#AEAEAE] text-[#535353] dark:hover:text-white hover:text-black" />
						) : (
							<Icons.LoudVolume className="dark:text-[#AEAEAE] text-[#535353] dark:hover:text-white hover:text-black" />
						)}
					</button>

					<div className="flex items-center">
						<input
							type="range"
							min="0"
							max="1"
							step="0.01"
							value={isMuted ? 0 : volume}
							onChange={handleVolumeChange}
							className="cursor-pointer w-[100px] h-[5px]"
						/>
					</div>
				</div>
				<button onClick={handleFullscreen} className="p-1">
					{isFullscreen ? (
						<Icons.ExitFullScreen className="dark:text-[#AEAEAE] text-[#535353] dark:hover:text-white hover:text-black" />
					) : (
						<Icons.FullScreen className="dark:text-[#AEAEAE] text-[#535353] dark:hover:text-white hover:text-black" />
					)}
				</button>
			</div>
		</div>
	);
}

export type UserListStreamChannelProps = {
	readonly memberJoin: IChannelMember[];
	readonly memberMax?: number;
};

function UserListStreamChannel({ memberJoin, memberMax }: UserListStreamChannelProps) {
	const [displayedMembers, setDisplayedMembers] = useState<IChannelMember[]>(memberJoin || []);

	useEffect(() => {
		const handleSizeWidth = () => {
			let membersToShow = memberJoin || [];
			if (window.innerWidth < 900) {
				membersToShow = membersToShow.slice(0, memberMax ? memberMax : 3);
			} else if (window.innerWidth < 1000) {
				membersToShow = membersToShow.slice(0, memberMax ? memberMax : 4);
			} else if (window.innerWidth < 1200) {
				membersToShow = membersToShow.slice(0, memberMax ? memberMax : 5);
			} else if (window.innerWidth > 1200) {
				membersToShow = membersToShow.slice(0, memberMax ? memberMax : 7);
			}
			setDisplayedMembers(membersToShow);
		};

		handleSizeWidth();
		window.addEventListener('resize', handleSizeWidth);

		return () => {
			window.removeEventListener('resize', handleSizeWidth);
		};
	}, [memberJoin, memberMax]);

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
					<div className="bg-black bg-opacity-10 rounded-lg px-2 py-[4px]">
						<p className="text-sm font-medium text-white">{name && name.length > 20 ? `${name.substring(0, 20)}...` : name}</p>
					</div>
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
	const streamPlay = useSelector(selectStatusStream);
	const appearanceTheme = useSelector(selectTheme);
	const { userProfile } = useAuth();
	const dispatch = useAppDispatch();
	const [showMembers, setShowMembers] = useState(true);

	const handleLeaveChannel = async () => {
		if (currentStreamInfo) {
			dispatch(videoStreamActions.stopStream());
		}
		dispatch(usersStreamActions.remove(userProfile?.user?.id || ''));
		setShowMembers(true);
	};

	const handleJoinChannel = async () => {
		dispatch(videoStreamActions.startStream(currentStreamInfo as IStreamInfo));
	};

	const toggleMembers = () => {
		setShowMembers((prev) => !prev);
	};

	return !streamPlay ? (
		<div className="w-full h-full bg-black flex justify-center items-center">
			<div className="flex flex-col justify-center items-center gap-4 w-full">
				<div className="w-full flex gap-2 justify-center p-2">
					{memberJoin.length > 0 && <UserListStreamChannel memberJoin={memberJoin} memberMax={3}></UserListStreamChannel>}
				</div>
				<div className="max-w-[350px] text-center text-3xl font-bold">
					{channelName && channelName.length > 20 ? `${channelName.substring(0, 20)}...` : channelName}
				</div>
				{memberJoin.length > 0 ? <div>Everyone is waiting for you inside</div> : <div>No one is currently in stream</div>}
				<button className="bg-green-700 rounded-3xl p-2 hover:bg-green-600" onClick={handleJoinChannel}>
					Join stream
				</button>
			</div>
		</div>
	) : (
		<div className="w-full h-full flex relative group">
			<div className="flex flex-col justify-center gap-1 w-full">
				<div className="relative min-h-40 items-center flex justify-center">
					{hlsUrl ? (
						<div className={`transition-all duration-300 w-${showMembers ? '[70%]' : '[100%]'}`}>
							<HLSPlayer src={hlsUrl} />
						</div>
					) : (
						<div className="sm:h-[250px] md:h-[350px] lg:h-[450px] xl:h-[550px] w-[70%] dark:text-[#AEAEAE] text-colorTextLightMode dark:bg-bgSecondary600 bg-channelTextareaLight text-5xl flex justify-center items-center text-center">
							<span>No stream today</span>
						</div>
					)}
					{memberJoin.length > 0 && (
						<div
							className={`absolute z-50 opacity-0 transition-opacity duration-300 ${showMembers ? '-bottom-14' : 'bottom-14 max-[1700px]:bottom-2'} group-hover:opacity-100`}
						>
							<Tooltip
								content={`${showMembers ? 'Hide Members' : 'Show Members'}`}
								trigger="hover"
								animation="duration-500"
								style={appearanceTheme === 'light' ? 'light' : 'dark'}
								className="dark:!text-white !text-black w-max"
							>
								<div
									onClick={toggleMembers}
									className="flex gap-1 items-center cursor-pointer bg-neutral-700 hover:bg-bgSecondary600 rounded-3xl px-2 py-[6px]"
								>
									<Icons.ArrowDown
										defaultFill="white"
										defaultSize={`size-6 transition-all duration-300 ${showMembers ? '' : '-rotate-180'}`}
									></Icons.ArrowDown>
									<Icons.MemberList isWhite />
								</div>
							</Tooltip>
						</div>
					)}
				</div>
				{memberJoin.length > 0 && (
					<div
						className={`w-full flex gap-2 justify-center p-2 transition-opacity duration-300 ${showMembers ? 'opacity-100' : 'opacity-0'}`}
					>
						{showMembers && <UserListStreamChannel memberJoin={memberJoin}></UserListStreamChannel>}
					</div>
				)}
			</div>
			<div className="absolute z-50 bottom-4 left-1/2 transform -translate-x-1/2 translate-y-5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
				<button onClick={handleLeaveChannel} className="bg-red-600 flex justify-center items-center rounded-full p-3 hover:bg-red-500">
					<Icons.EndCall className="w-6 h-6" />
				</button>
			</div>
		</div>
	);
}
