export type MemberProfileProps = {
    avatar: string;
    name: string;
    status?: boolean;
    isHideStatus: boolean;
    numberCharacterCollapse?: number;
    textColor?: string
};

function MemberProfile({
    avatar,
    name,
    status,
    isHideStatus,
    numberCharacterCollapse = 6,
    textColor ="contentSecondary"
}: MemberProfileProps) {
    return (
        <div className="relative gap-[5px] flex items-center ">
            <a className="mr-[2px] relative inline-flex items-center justify-start w-10 h-10 text-lg text-white rounded-full">
                {avatar ? (
                    <img
                        src={avatar}
                        style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                        }}
                    />
                ) : (
                    <div className="w-[38px] h-[38px] bg-bgDisable rounded-full flex justify-center items-center text-contentSecondary text-[16px]">
                        {name.charAt(0).toUpperCase()}
                    </div>
                )}
                {!isHideStatus ? (
                    <span
                        className={`absolute bottom-[-0px] right-[-1px] inline-flex items-center justify-center gap-1 p-1 text-sm text-white border-[4px] border-bgSurface rounded-full ${!status ? 'bg-colorNeutral' : 'bg-colorSuccess'}`}
                    >
                        <span className="sr-only"> </span>
                    </span>
                ) : (
                    <></>
                )}
            </a>
            <div className="flex flex-col items-start">
                <p
                    className="text-[15px]"
                    title={name && name.length > numberCharacterCollapse ? name : undefined}
                >
                    {name && name.length > numberCharacterCollapse
                        ? `${name.substring(0, numberCharacterCollapse)}...`
                        : name}
                </p>

                <span className={`text-[11px] text-${textColor}`}>  
                    {!status ? 'Offline' : 'Online'}
                </span>
            </div>
        </div>
    );
}

export default MemberProfile;
