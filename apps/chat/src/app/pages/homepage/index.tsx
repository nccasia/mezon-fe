import { Icons } from '@mezon/components';
import { selectIsLogin } from '@mezon/store';
import { Image } from '@mezon/ui';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import DancingRobot from '../../../assets/dancing-robot.gif';
import BannerImg from '../../../assets/homepage-banner.png';
import SideBar from './sidebar';

function Homepage() {
	const isLogin = useSelector(selectIsLogin);
	const [sideBarIsOpen, setSideBarIsOpen] = useState(false);

	const toggleSideBar = () => {
		setSideBarIsOpen(!sideBarIsOpen);
	};
	return (
		<div className="relative">
			<div
				className="layout relative z-10 flex flex-col items-center text-textDarkTheme h-fit min-h-screen"
				style={{ backgroundImage: 'url(../../../assets/homepage-bg.png)' }}
			>
				<div
					className={`header w-10/12 max-lg:w-full max-lg:px-[35px] mt-5 flex items-center ${sideBarIsOpen ? 'justify-end' : 'justify-between'} `}
				>
					{!sideBarIsOpen && (
						<Link to={'/mezon'} className="left flex gap-[10px] items-center">
							<Image
								src={`assets/images/mezon-logo-black.svg`}
								alt={'logoMezon'}
								width={48}
								height={48}
								className="w-10 aspect-square object-cover"
							/>
							<div className="uppercase font-bold tracking-wide text-[20px]">Mezon</div>
						</Link>
					)}
					<div className="mid flex gap-[40px] items-center font-semibold max-lg:hidden">
						<div className="hover:underline cursor-pointer">Download</div>
						<div className="hover:underline cursor-pointer">Nitro</div>
						<div className="hover:underline cursor-pointer">Discover</div>
						<div className="hover:underline cursor-pointer">Safety</div>
						<div className="hover:underline cursor-pointer">Support</div>
						<div className="hover:underline cursor-pointer">Blog</div>
						<div className="hover:underline cursor-pointer">Careers</div>
					</div>
					<div className="flex gap-2 w-fit">
						{isLogin ? (
							<Link
								className="right px-[16px] py-[7px] bg-white rounded-3xl text-black font-semibold hover:text-[#5865f2] w-[120px]"
								to={'/mezon'}
							>
								Open Mezon
							</Link>
						) : (
							<Link
								className="right px-[16px] py-[7px] bg-white rounded-3xl text-black font-semibold hover:text-[#5865f2]"
								to={'/mezon'}
							>
								Login
							</Link>
						)}
						<Icons.HomepageMenu className="hidden w-[40px] max-lg:block" onClick={toggleSideBar} />
					</div>
				</div>
				<div className="container w-10/12">
					<div className="main-content">
						<div className="block1 flex items-center justify-center max-lg:flex-col">
							<img src={BannerImg} alt="" className="object-cover w-6/12 max-md:w-8/12 hidden max-lg:block" />
							<div className="b1-left mt-10 max-lg:text-center flex flex-col max-md:items-center">
								<div className='w-[150px] -z-10 relative top-[19px] left-[20px]'>
									<img src={DancingRobot} alt="" className='w-full' />
								</div>
								<div className="top-text text-[50px] max-md:text-[30px] font-black leading-[60px] max-md:leading-[40px]">GROUP CHAT THAT’S ALL FUN & GAMES</div>
								<div className="bottom-text text-[24px] max-md:text-[17px]">
									Mezon is great for playing games and chilling with friends, or even building a worldwide community. Customize your
									own space to talk, play, and hang out.
								</div>
							</div>
							<img src={BannerImg} alt="" className="object-cover w-6/12 block max-lg:hidden" />
						</div>
						<div className="block2 flex justify-center items-center gap-[24px] mt-10 max-md:flex-col mb-10">
							<div
								style={{ borderRadius: '28px' }}
								className="max-md:w-7/12 max-sm:w-11/12 flex items-center justify-center text-black bg-white px-[32px] py-[16px] text-[20px] font-semibold leading-[24px] cursor-pointer hoverBoxShadow"
							>
								<Icons.HomepageDownload className="text-black" />
								<div>Download for Windows</div>
							</div>
							<Link
								to={'/mezon'}
								className="max-md:w-7/12 max-sm:w-11/12 text-white bg-[#161cbb] px-[32px] py-[16px] text-[20px] font-semibold leading-[24px] text-center hoverBoxShadow"
								target="_blank"
								rel="noreferrer"
								style={{ borderRadius: '28px' }}
							>
								Open Mezon in your browser
							</Link>
						</div>
					</div>
				</div>
			</div>
			<SideBar sideBarIsOpen={sideBarIsOpen} toggleSideBar={toggleSideBar} />
		</div>
	);
}

export default Homepage;
