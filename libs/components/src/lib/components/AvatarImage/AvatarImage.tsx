import { DetailedHTMLProps, ImgHTMLAttributes, useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { twMerge } from 'tailwind-merge';

export type AvatarImageProp = {
	userName?: string;
	alt: string;
	isAnonymous?: boolean;
	classNameText?: string;
} & DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;

export const AvatarImage = ({ userName, src, alt, className = '', isAnonymous, classNameText, ...rest }: AvatarImageProp) => {
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);

	const computedClassName = twMerge('size-10 rounded-full object-cover min-w-5 min-h-5 cursor-pointer ' + className);

	const handleLoadStart = () => {
		setIsLoading(true);
		setIsError(false);
	};

	const handleLoad = () => {
		setIsLoading(false);
		setIsError(false);
	};

	const handleError = () => {
		setIsLoading(false);
		setIsError(true);
	};

	useEffect(() => {
		setIsError(false);
	}, [src]);

	if ((!src && !userName) || isAnonymous) return <img className={computedClassName} src="./assets/images/anonymous-avatar.jpg" alt={'anonymous-avatar'} {...rest} />;

	if (!src || isError) {
		const avatarChar = userName?.charAt(0)?.toUpperCase() || '';

		return (
			<div className={`size-10 dark:bg-slate-700 bg-slate-200 rounded-full flex justify-center items-center dark:text-white text-black text-[16px] ${className} ${classNameText}`}>
				{avatarChar}
			</div>
		);
	}

	return isLoading ? (
		<div className={`size-10 ${className}`}>
			<Skeleton circle={true} className="block h-full" />
		</div>
	) : (
		<img onLoadStart={handleLoadStart} onLoad={handleLoad} onError={handleError} className={computedClassName} src={src} alt={alt} {...rest} />
	);
};
