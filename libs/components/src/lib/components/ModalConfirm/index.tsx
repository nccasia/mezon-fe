
interface ModalConfirmProps {
  handleCancel: () => void;
  handleConfirm: () => void;
  /**  Recommend lowercase */ 
  title?: string;
  leaveName?: string;
  buttonName?: string;
  buttonColor?: string;
}

const ModalConfirm = ({ handleCancel, title = "Title Modal", buttonName = "OK", leaveName, handleConfirm, buttonColor }: ModalConfirmProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
      <div className="fixed inset-0 bg-black opacity-80" />
      <div className="relative z-10 w-[440px]">
        <div className="dark:bg-[#313338] bg-white pt-[16px] px-[16px]">
          <div className="dark:text-textDarkTheme text-textLightTheme text-[20px] font-semibold pb-[16px]">
            <span className="capitalize mr-1">
              {title}
            </span>
            {leaveName}
          </div>
          <div className="dark:text-[#dbdee1] text-textLightTheme pb-[20px]">
            Are you sure you want to {title} <b className="font-semibold">{leaveName}</b> ? You won’t be able to re-join this
            server unless you are re-invited.
          </div>
        </div>
        <div className="dark:bg-[#2b2d31] bg-[#f2f3f5] dark:text-textDarkTheme text-textLightTheme flex justify-end items-center gap-4 p-[16px] text-[14px] font-medium">
          <div onClick={handleCancel} className="hover:underline cursor-pointer">
            Cancel
          </div>
          <div className={`bg-red-600 hover:bg-red-700 text-white rounded-sm px-[25px] py-[8px] cursor-pointer ${buttonColor}`} onClick={handleConfirm}>
            {buttonName}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirm;
