import { Image } from '@mezon/ui';
interface FooterProps {
	downloadUrl: string;
}
const Footer = ({ downloadUrl }: FooterProps) => {
	return (
		<div>
			<div
				className="bg-[#0A052C] relative flex flex-col items-center bg-no-repeat"
				style={{ backgroundImage: 'url(../../../assets/ellipse.svg)' }}
			>
				<div className="pt-[64px] pb-[48px] flex flex-col w-10/12 max-lg:w-full">
					<div className="w-full pr-[32px] pl-[32px] flex justify-between gap-[48px] max-lg:flex-col">
						<div className="flex flex-col gap-[24px] max-w-[320px]">
							<div className="flex items-center gap-[5px]">
								<Image
									src={`assets/images/mezon-logo-black.svg`}
									alt={'logoMezon'}
									width={32}
									height={32}
									className="aspect-square object-cover"
								/>
								<div className="text-[22.15px] leading-[26.58px] font-semibold text-[#FFFFFF]">mezon</div>
							</div>
							<div className="text-[16px] leading-[24px] font-normal text-[#8FA7BF]">
								Mezon is great for playing games and chilling with friends, or even building a worldwide community.{' '}
							</div>
						</div>
						<div className="flex gap-[32px] max-lg:flex-col">
							<div className="flex flex-col gap-[12px]">
								<a
									href="#"
									className="pr-[2px] pl-[2px] text-[16px] leading-[24px] font-semibold text-[#7C92AF]"
									target="_blank"
									rel="noreferrer"
								>
									Executive Summary
								</a>
								<a
									href=""
									className="pr-[2px] pl-[2px] text-[16px] leading-[24px] font-semibold text-[#7C92AF]"
									target="_blank"
									rel="noreferrer"
								>
									Problem Statement
								</a>
								<a
									href=""
									className="pr-[2px] pl-[2px] text-[16px] leading-[24px] font-semibold text-[#7C92AF]"
									target="_blank"
									rel="noreferrer"
								>
									Solution
								</a>
								<a
									href=""
									className="pr-[2px] pl-[2px] text-[16px] leading-[24px] font-semibold text-[#7C92AF]"
									target="_blank"
									rel="noreferrer"
								>
									Blockhain & Token Economy
								</a>
								<a
									href=""
									className="pr-[2px] pl-[2px] text-[16px] leading-[24px] font-semibold text-[#7C92AF]"
									target="_blank"
									rel="noreferrer"
								>
									Developer API Intergration
								</a>
							</div>
							<div className="flex flex-col gap-[12px]">
								<a
									href=""
									target="_blank"
									rel="noreferrer"
									className="pr-[2px] pl-[2px] text-[16px] leading-[24px] font-semibold text-[#7C92AF]"
								>
									Technical Architecture
								</a>
								<a
									href=""
									className="pr-[2px] pl-[2px] text-[16px] leading-[24px] font-semibold text-[#7C92AF]"
									target="_blank"
									rel="noreferrer"
								>
									Product roadmap
								</a>
								<a
									href=""
									className="pr-[2px] pl-[2px] text-[16px] leading-[24px] font-semibold text-[#7C92AF]"
									target="_blank"
									rel="noreferrer"
								>
									{' '}
									Tokenomics
								</a>
								<a
									href=""
									className="pr-[2px] pl-[2px] text-[16px] leading-[24px] font-semibold text-[#7C92AF]"
									target="_blank"
									rel="noreferrer"
								>
									Team
								</a>
							</div>
						</div>
						<div className="flex flex-col gap-[16px]">
							<div className="text-[14px] leading-[20px] font-semibold text-[#F5F5F6]">Get the app</div>
							<div className="flex flex-col gap-[16px]">
								<a href="https://apps.apple.com/vn/app/mezon/id6502750046" target="_blank" rel="noreferrer">
									<Image src={`assets/app-store.svg`} alt={'appStore'} className="max-w-[135px]" />
								</a>
								<a href="https://play.google.com/store/apps/details?id=com.mezon.mobile" target="_blank" rel="noreferrer">
									<Image src={`assets/google-play.svg`} alt={'googlePlay'} className="max-w-[135px]" />
								</a>
								<a href={downloadUrl} target="_blank" rel="noreferrer">
									<Image src={`assets/microsoft.svg`} alt={'microsoft'} className="max-w-[135px]" />
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="bg-[#0B0E2D] pt-[48px] pb-[48px] flex flex-col items-center">
				<div className="w-10/12 pl-[32px] pr-[32px] flex items-center gap-[32px] justify-between max-lg:gap-[24px] max-lg:w-full max-lg:flex-col-reverse max-lg:items-start">
					<div className="text-[16px] leading-[24px] font-normal text-[#7C92AF]">© 2024 Mezon. All rights reserved.</div>
					<div className="flex items-center gap-[24px]">
						<a href="#" target="_blank" rel="noreferrer">
							<Image src={`assets/instagram.svg`} alt={'instagram'} />
						</a>
						<a href="#" target="_blank" rel="noreferrer">
							<Image src={`assets/facebook.svg`} alt={'facebook'} />
						</a>
						<a href="#" target="_blank" rel="noreferrer">
							<Image src={`assets/twitter.svg`} alt={'twitter'} />
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Footer;
