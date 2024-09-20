import { AvatarImage, Icons, getColorAverageFromURL } from '@mezon/components';
import { selectMemberClanByGoogleId, selectMemberClanByUserId, useAppSelector } from '@mezon/store';
import { NameComponent } from '@mezon/ui';
import { IChannelMember, getAvatarForPrioritize, getNameForPrioritize } from '@mezon/utils';
import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

interface MediaPlayerProps {
	src: string;
}

function HLSPlayer({ src }: MediaPlayerProps) {
	const videoRef = useRef<HTMLVideoElement | null>(null);

	useEffect(() => {
		const videoElement = videoRef.current;

		if (videoElement) {
			// Check if HLS is supported
			if (Hls.isSupported()) {
				const hls = new Hls({
					lowLatencyMode: true,
					enableWorker: true,
					maxBufferLength: 30,
					maxBufferSize: 60 * 1000 * 1000
					// backBufferLength: 90,
					// liveBackBufferLength: 0,
					// liveSyncDuration: 0.5,
					// liveMaxLatencyDuration: 5,
					// liveDurationInfinity: true,
					// highBufferWatchdogPeriod: 1,
					// manifestLoadingTimeOut: 15000
				});

				let retryCount = 0;
				const maxRetries = 10;

				hls.on(Hls.Events.ERROR, (evt, data) => {
					if (data.fatal) {
						if (data?.type === Hls.ErrorTypes.NETWORK_ERROR && retryCount < maxRetries) {
							console.log('Network error, retrying...');
							retryCount++;
							setTimeout(() => {
								hls.loadSource(src);
							}, 2000); // Delay 2s before retry
						}
					}
				});

				hls.loadSource(src);
				hls.attachMedia(videoElement);
				hls.on(Hls.Events.MANIFEST_PARSED, () => {
					videoElement.play().catch((error) => {
						console.error('Error playing video:', error);
					});
				});

				// Clean up when component is unmounted
				return () => {
					hls.destroy();
				};
			} else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
				// HLS support natively
				videoElement.src = src;
				videoElement.addEventListener('loadedmetadata', () => {
					videoElement.play().catch((error) => {
						console.error('Error playing video:', error);
					});
				});
			} else {
				// Fallback for other video formats
				videoElement.src = src;
				videoElement.addEventListener('loadedmetadata', () => {
					videoElement.play().catch((error) => {
						console.error('Error playing video:', error);
					});
				});
			}
		}
	}, [src]);

	return (
		<video
			ref={videoRef}
			controls
			autoPlay
			playsInline
			muted
			style={{ width: '100%' }}
			controlsList="nodownload noremoteplayback noplaybackrate"
			disablePictureInPicture
		/>
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

	return displayedMembers.map((item: IChannelMember) => {
		return (
			<div key={item.id} className="w-[250px] h-[100px] min-w-[100px] min-h-[100px]">
				<UserItem user={item} />
			</div>
		);
	});
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

	const checkUrl = (url: string | undefined) => {
		if (url !== undefined && url !== '') return true;
		return false;
	};

	const [color, setColor] = useState<string>('');

	useEffect(() => {
		const getColor = async () => {
			if (checkUrl(avatarUrl)) {
				const url = avatarUrl;
				const colorImg = await getColorAverageFromURL(url || '');
				if (colorImg) setColor(colorImg);
			}
		};

		getColor();
	}, [avatarUrl]);
	return (
		<div
			className="relative w-full h-full flex p-1 justify-center items-center gap-3 cursor-pointer rounded-lg"
			style={{ backgroundColor: color ? color : 'grey' }}
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
};

export default function ChannelStream({ hlsUrl, memberJoin }: ChannelStreamProps) {
	return (
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
		</div>
	);
}
