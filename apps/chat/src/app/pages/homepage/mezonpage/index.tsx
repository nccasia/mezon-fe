import { version } from '@mezon/package-js';
import { Icons } from '@mezon/ui';
import { getPlatform } from '@mezon/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import Footer from './footer';
import HeaderMezon from './header';
import Layout, { useIntersectionObserver } from './layouts';
import { SideBarMezon } from './sidebar';

function MezonPage() {
	const platform = getPlatform();
	const [sideBarIsOpen, setSideBarIsOpen] = useState(false);
	const [backgroundImage, setBackgroundImage] = useState('');

	const homeRef = useRef<HTMLDivElement>(null);
	const isVisible = useIntersectionObserver(homeRef, { threshold: 0.1 });

	const toggleSideBar = () => {
		setSideBarIsOpen(!sideBarIsOpen);
	};

	const downloadUrl: string = useMemo(() => {
		if (platform === 'MacOS') {
			return `https://cdn.mezon.vn/release/mezon-${version}-mac-arm64.zip`;
		} else if (platform === 'Linux') {
			return `https://cdn.mezon.vn/release/mezon-${version}-linux-amd64.deb`;
		}
		return `https://cdn.mezon.vn/release/mezon-${version}-win-x64.exe`;
	}, [platform]);

	const updateBackgroundImage = () => {
		if (window.innerWidth < 768) {
			setBackgroundImage('url(../../../assets/hero-header-bg-mobile.png)');
		} else {
			setBackgroundImage('url(../../../assets/hero-header-bg-desktop.png)');
		}
	};

	const backgroundImageStyle = {
		backgroundImage: backgroundImage,
		backgroundRepeat: 'no-repeat',
		backgroundPosition: 'center top'
	};

	const scrollToSection = (id: string, event: React.MouseEvent) => {
		event.preventDefault();

		const section = document.getElementById(id);
		if (!section) return;

		const offset = window.innerWidth <= 768 ? 72 : 80;
		const sectionTop = section.getBoundingClientRect().top + window.scrollY - offset;

		setSideBarIsOpen(false);

		window.scrollTo({
			behavior: 'smooth',
			top: sectionTop
		});
	};

	useEffect(() => {
		updateBackgroundImage();
		window.addEventListener('resize', updateBackgroundImage);

		return () => window.removeEventListener('resize', updateBackgroundImage);
	}, []);

	return (
		<div
			className="relative bg-[#0B0E2D]"
			style={{
				fontFamily: 'Inter'
			}}
		>
			<div
				className="layout relative flex flex-col items-center text-textDarkTheme overflow-hidden scroll-smooth"
				style={{
					background: 'linear-gradient(rgba(3, 3, 32, 0) -15.28%, rgb(15, 15, 99) -93.02%, rgba(3, 3, 32, 0) 105.23%)'
				}}
			>
				{!sideBarIsOpen && <HeaderMezon sideBarIsOpen={sideBarIsOpen} toggleSideBar={toggleSideBar} scrollToSection={scrollToSection} />}

				<div className="container w-10/12 max-lg:w-full max-md:px-[16px] max-md:mt-[72px]" id="home" ref={homeRef}>
					<div
						className={`max-md:pb-0 max-md:mt-[36px] md:mt-[200px] md:pb-[120px] flex flex-col gap-[48px] max-md:gap-[32px] md:px-[32px] transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
						style={backgroundImageStyle}
					>
						<div className="flex flex-col items-center justify-center gap-[24px] m-auto text-center w-full max-w-full md:max-w-[662px]">
							<h1 className="tracking-[-.02em] text-center text-[60px] max-md:text-[36px] font-black leading-[72px] max-md:leading-[48px] font-semibold font-['Poppins'] text-[#F4F7F9] max-md:text-textDarkTheme">
								Your clan & your world
							</h1>
							<div className="text-[20px] text-[#C2D5DF] text-center leading-[30px] font-normal hidden md:block">
								<div>Mezon is great for playing games and chilling with friends, </div>
								<div>or even building a worldwide community.</div>
								<div>Customize your own space to talk, play, and hang out.</div>
							</div>
						</div>
						<div className="flex justify-center items-center gap-[12px]">
							<a className="cursor-pointer" href="https://apps.apple.com/vn/app/mezon/id6502750046" target="_blank" rel="noreferrer">
								<Icons.AppStoreBadge className="max-w-full max-md:h-[32px] max-md:w-[98px]" />
							</a>
							<a
								className="cursor-pointer"
								href="https://play.google.com/store/apps/details?id=com.mezon.mobile"
								target="_blank"
								rel="noreferrer"
							>
								<Icons.GooglePlayBadge className="max-w-full max-md:h-[32px] max-md:w-full" />
							</a>
							<a className="cursor-pointer" href={downloadUrl} target="_blank" rel="noreferrer">
								{platform === 'MacOS' ? (
									<Icons.MacAppStoreDesktop className="max-w-full max-md:h-[32px] max-md:w-full" />
								) : (
									<Icons.MicrosoftBadge className="max-w-full max-md:h-[32px] max-md:w-full" />
								)}
							</a>
						</div>
					</div>
				</div>

				{sideBarIsOpen && <SideBarMezon sideBarIsOpen={sideBarIsOpen} toggleSideBar={toggleSideBar} scrollToSection={scrollToSection} />}

				{!sideBarIsOpen && (
					<div className="hidden md:block absolute top-0 w-[400px] h-[400px] bg-[#8D72C5] rounded-[50%] filter blur-[200px] mix-blend-color-dodge"></div>
				)}
			</div>

			<Layout sideBarIsOpen={sideBarIsOpen} />
			<Footer downloadUrl={downloadUrl}></Footer>
		</div>
	);
}

export default MezonPage;
