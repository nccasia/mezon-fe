import { Chevron, HeadPhoneICon, MemberProfile, MicIcon, SettingProfile } from '@mezon/components'
import IconLogoUser from "../../../../../../apps/chat/src/assets/Images/logoTest.png"
export type FooterProfileProps = {
    name: string
    status?: boolean;
    avatar: string;
    openSetting: () => void
}

function FooterProfile({ name, status, avatar, openSetting }: FooterProfileProps) {
    return (
        <button className="text-contentTertiary flex items-center justify-between border-t-2 border-borderDefault px-4 py-3 font-title text-[15px] font-[500] text-white hover:bg-gray-550/[0.16] shadow-sm transition">
            <MemberProfile name={name} status={status} avatar={avatar} isHideStatus={false} numberCharacterCollapse={15} />
            <div className='flex items-center gap-2'>
                <MicIcon className="ml-auto w-[18px] h-[18px] opacity-80" />
                <HeadPhoneICon className="ml-auto w-[18px] h-[18px] opacity-80" />
                <SettingProfile className="ml-auto w-[18px] h-[18px] opacity-80" onClick={openSetting} />
            </div>
        </button>
    )
}

export default FooterProfile
