import { Image } from '@mezon/ui';
import { useRouteError } from 'react-router-dom';

const ErrorRoutes = () => {
	const error = useRouteError();
	console.error(error);
	return (
		<div
			style={{ backgroundImage: `url(assets/images/bg-boundary.svg)` }}
			className="flex flex-col items-center justify-center min-h-screen bg-gray-500 text-gray-300 p-4 error-boundary"
		>
			<div className="max-w-md w-full text-center">
				<div className="flex justify-center">
					<Image src={`assets/images/error-boundary.svg`} alt="error-boundary" />
				</div>
				<h2 className="mt-6 text-2xl leading-[8px] mb-4 font-semibold text-center text-white leading-none">Well, this is awkward</h2>
				<p className="m-3.5 text-base leading-none">Looks like Mezon has crashed unexpectedly....</p>
				<p className="m-3.5 text-base leading-none">We've tracked the error and will get right on it.</p>
				<div className="mt-6">
					<button
						className="bg-[#5864f2] hover:bg-indigo-600 text-white font-medium w-[130px] h-[44px] px-4 rounded text-sm"
						onClick={() => {
							window.location.replace('/chat/direct/friends');
						}}
					>
						Reload
					</button>
				</div>
			</div>
		</div>
	);
};

export default ErrorRoutes;
