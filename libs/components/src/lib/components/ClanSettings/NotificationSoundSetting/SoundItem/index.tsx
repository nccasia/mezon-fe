import { Icons } from '@mezon/ui';
import { formatTimeToMMSS } from '@mezon/utils';
import React, { useEffect, useRef, useState } from 'react';

interface ISoundItemProps {
	sound: {
		id: number;
		fileName: string;
		src: string;
	};
	isSelected: boolean;
	onPlay?: () => void;
	onSelect?: () => void;
	isPlaying?: boolean;
}

const SoundItem: React.FC<ISoundItemProps> = ({ sound, isSelected, onPlay, onSelect, isPlaying }) => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [duration, setDuration] = useState(0);

	useEffect(() => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.play();
			} else {
				audioRef.current.pause();
				audioRef.current.currentTime = 0;
			}
		}
	}, [isPlaying]);

	const handleOnClickPlay = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		if (audioRef.current) {
			audioRef.current.currentTime = 0;
			audioRef.current.play();
		}
		if (onPlay) {
			onPlay();
		}
	};

	const handleLoadedMetadata = () => {
		if (audioRef.current) {
			setDuration(audioRef.current.duration);
		}
	};

	return (
		<>
			<div
				className={`flex items-center dark:hover:bg-bgHover hover:bg-[#f9f9f9] ${isSelected ? 'dark:bg-bgModifierHover bg-bgModifierHoverLight dark:text-white text-textSecondary400' : ''} px-2 py-3 h-fit cursor-pointer`}
				onClick={onSelect}
			>
				<p className={`dark:text-textSecondary text-textSecondary800 ${isSelected && 'font-semibold dark:text-white text-black'} w-1/2`}>
					{sound.fileName}
				</p>
				<audio className="flex-grow bg-transparent" src={sound.src} ref={audioRef} onLoadedMetadata={handleLoadedMetadata} />
				<p className={'dark:text-textSecondary text-textSecondary800 w-1/3'}>{formatTimeToMMSS(duration)}</p>
				<button onClick={handleOnClickPlay} className={'ml-auto flex justify-center'}>
					<Icons.Speaker />
				</button>
			</div>
			<div className={'dark:bg-bgModifierHover bg-bgModifierHoverLight h-[1px]'}></div>
		</>
	);
};

export default SoundItem;
