import { Icons } from '@mezon/components';
import { Image } from '@mezon/ui';
import { Link } from 'react-router-dom';

interface SideBarProps {
	sideBarIsOpen: boolean;
	toggleSideBar: () => void;
}

const SideBar = ({ sideBarIsOpen, toggleSideBar }: SideBarProps) => {
	return (
		<div
			className={`fixed top-0 right-0 z-40 w-[350px] h-screen p-[24px] overflow-y-auto transition-transform duration-[400ms] ${sideBarIsOpen ? 'translate-x-0' : 'translate-x-full'} bg-white text-black`}
			tabIndex={-1}
			style={{ borderRadius: '15px 0 0 15px' }}
		>
			<div className="flex flex-col justify-between h-full">
				<div>
					<div className="flex justify-between items-center pb-[24px] border-b">
						<Link to={'/mezon'} className="left flex gap-[10px] items-center w-1/3">
							<Image
								src={`assets/images/mezon-logo-white.svg`}
								alt={'logoMezon'}
								width={48}
								height={48}
								className="w-10 aspect-square object-cover"
							/>
							<div className="uppercase font-bold tracking-wide text-[20px]">Mezon</div>
						</Link>
						<button type="button" onClick={toggleSideBar} className="">
							<Icons.MenuClose className="w-[15px]" />
						</button>
					</div>
				</div>
				<div className="flex flex-col gap-3 mb-[70px]">
					<a
						className="bottom flex flex-1 items-center justify-center text-white bg-[#5865f2] px-[20px] py-[7px] font-semibold cursor-pointer"
						style={{ borderRadius: '28px' }}
						href="https://play.google.com/store/apps/details?id=com.mezon.mobile"
						target="_blank"
						rel="noreferrer"
					>
						<Icons.GooglePlay className="text-white w-[24px]" />
						<div className="">Download for Android</div>
					</a>
					<a
						className="bottom flex flex-1 items-center justify-center text-white bg-[#5865f2] px-[20px] py-[7px] font-semibold cursor-pointer"
						style={{ borderRadius: '28px' }}
						href="https://apps.apple.com/vn/app/mezon/id6502750046"
						target="_blank"
						rel="noreferrer"
					>
						<Icons.AppStore className="text-white w-[24px]" />
						<div className="">Download for IOS</div>
					</a>
				</div>
			</div>
		</div>
	);
};

export default SideBar;
