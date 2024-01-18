import {
  Chevron,
  HeadPhoneICon,
  MicIcon,
  SettingProfile,
} from '@mezon/components';
import IconLogoUser from '../../../../../../apps/chat/src/assets/Images/logoTest.png';
export type FooterProfileProps = {
  name: string;
  status: string;
};

function FooterProfile({ name, status }: FooterProfileProps) {
  return (
    <button className="text-contentTertiary bg-[#0b0b0b] w-[272px] border flex items-center justify-between border-t-2 border-borderDefault px-4 py-3 font-title text-[15px] font-[500] text-white hover:bg-gray-550/[0.16] shadow-sm transition">
      <div className="relative mr-1 flex items-center">
        <a className="mr-[2px] relative inline-flex items-center justify-start w-10 h-10 text-lg text-white rounded-full">
          <img src={IconLogoUser} width={30} />
          <span className="absolute bottom-[2px] right-[6px] inline-flex items-center justify-center gap-1 p-1 text-sm text-white bg-colorSuccess border-[3.5px]  border-bgSurface rounded-full">
            <span className="sr-only"> </span>
          </span>
        </a>
        <div className="flex flex-col items-start">
          <span className="text-[12px]">{name}</span>
          <span className="text-[10px] text-[400]">{status}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <MicIcon className="ml-auto w-[18px] h-[18px] opacity-80" />
        <HeadPhoneICon className="ml-auto w-[18px] h-[18px] opacity-80" />
        <SettingProfile className="ml-auto w-[18px] h-[18px] opacity-80" />
      </div>
    </button>
  );
}

export default FooterProfile;
