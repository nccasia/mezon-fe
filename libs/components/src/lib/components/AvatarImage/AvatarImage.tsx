import { DetailedHTMLProps, ImgHTMLAttributes, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { twMerge } from 'tailwind-merge';

export type AvatarImageProp = {
	userName?: string;
	alt: string;
} & DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;

export const AvatarImage = ({ userName, src, alt, className = '', ...rest }: AvatarImageProp) => {
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

	if (!src && !userName) return <img className={computedClassName} src="./assets/images/anonymous-avatar.jpg" alt={'anonymous-avatar'} {...rest} />;

	if (!src || isError) {
		const avatarChar = userName?.charAt(0)?.toUpperCase() || '';

		return (
			<div className={`size-10 bg-bgDisable rounded-full flex justify-center items-center text-contentSecondary text-[16px] ${className}`}>
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
