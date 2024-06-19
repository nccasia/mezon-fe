import { Icons } from "../../components";

type ModalUnknowChannelProps = {
    onClose: () => void;
}

function ModalUnknowChannel(props: ModalUnknowChannelProps) {
    const { onClose } = props;

    return (
        <div className="w-[100vw] h-[100vh] overflow-hidden fixed top-0 left-0 z-50 bg-black bg-opacity-80 flex flex-row justify-center items-center">
            <div className="w-fit h-fit dark:bg-bgPrimary bg-bgLightModeSecond rounded-lg flex-col justify-start  items-start gap-3 inline-flex overflow-hidden">
                <div className="dark:text-white text-black">
                    <div className="flex justify-between p-4">
                        <div className="flex flex-col items-center gap-y-3">
                            <Icons.IconClockChannel />
                            <h3 className="font-bold text-2xl dark:text-white text-black">You don't have access to this link.</h3>
                            <p>This link is to a clan or channel you don't have access to.</p>
                        </div>
                        <span className="text-5xl leading-3 dark:hover:text-white hover:text-black cursor-pointer" onClick={onClose}>×</span>
                    </div>
                    <div className="w-full dark:bg-bgSecondary bg-bgLightSecondary p-4">
                        <button 
                            className="px-4 py-2 hover:bg-opacity-85 rounded w-full bg-primary" 
                            onClick={onClose}
                            style={{color: 'white'}}
                        >Okay</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalUnknowChannel;