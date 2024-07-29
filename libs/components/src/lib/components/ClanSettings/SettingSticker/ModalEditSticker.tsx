import { Button, Icons, InputField } from "@mezon/ui";
import { ChangeEvent, useState } from "react";
import { ISticker } from ".";


type ModalEditStickerProps = {
  handleCloseModal: () => void
  editSticker: ISticker | null
};
type EdittingSticker = Pick<ISticker, 'source' | 'shortname'> & {
  fileName: string | null
}
const ModalSticker = ({ editSticker, handleCloseModal }: ModalEditStickerProps) => {
  const [editingSticker, setEditingSticker] = useState<EdittingSticker>({
    fileName: editSticker?.source.split('/').pop() ?? null,
    shortname: editSticker?.shortname ?? '',
    source: editSticker?.source ?? ''
  })
  const handleChooseFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const srcPreview = URL.createObjectURL(e.target.files[0]);
      setEditingSticker({
        ...editingSticker,
        source: srcPreview,
        shortname: e.target.files[0].name
      })
    } else {
      console.error("No files selected.");
    }
  }
  const handleChangeShortNameSticker = (e: ChangeEvent<HTMLInputElement>) => {
    setEditingSticker({
      ...editingSticker,
      shortname: e.target.value
    })
  }
  return (
    <div className={'relative w-full h-[468px] flex flex-col dark:bg-bgPrimary text-textPrimary '}>
      <div className={`w-full flex-1 flex flex-col overflow-hidden overflow-y-auto gap-4`}>
        <div className={`flex flex-col gap-2 items-center select-none dark:text-textPrimary text-textPrimaryLight`}>
          <p className="text-2xl font-semibold dark:text-bgTextarea text-textPrimaryLight">Upload a file</p>
          <p className="text-base">File should be APNG, PNG, or GIF (512KB max)</p>
        </div>
        <div className={"flex flex-col select-none dark:text-textPrimary text-textPrimaryLight"}>
          <p className="text-xs font-bold h-6 uppercase">PREVIEW</p>
          <div className={'flex items-center justify-center rounded-lg border-[0.08px] border-borderDivider overflow-hidden'}>
            <div className={'relative h-56 w-[50%] flex items-center justify-center bg-bgPrimary'}>
              {
                editingSticker.source ? <PreviewStickerBox preview={editingSticker.source} /> : <Icons.UploadImage className="w-16 h-16 text-bgLightModeSecond" />
              }
            </div>
            <div className={'h-56 w-[50%] flex items-center justify-center bg-bgLightModeSecond'}>
              {
                editingSticker.source ? <PreviewStickerBox preview={editingSticker.source} /> : <Icons.UploadImage className="w-16 h-16 text-bgPrimary" />
              }
            </div>
          </div>
        </div>
        <div className={"flex flex-row gap-4 dark:text-textPrimary text-textPrimaryLight"}>
          <div className={'w-1/2 flex flex-col gap-2'}>
            <p className={`text-xs font-bold uppercase select-none`}>FILE {editSticker && ' (THIS CANNOT BE EDITED)'}</p>
            <div className={`dark:bg-bgSecondary bg-bgLightSecondary border-[0.08px] dark:border-textLightTheme border-textDarkTheme flex flex-row rounded justify-between items-center py-[6px] px-3 dark:text-textPrimary box-border ${editingSticker.fileName && 'cursor-not-allowed'}`}>
              <p className="select-none">{editingSticker.fileName ?? 'Choose a file'}</p>
              {
                !editSticker && (
                  <button className="hover:bg-hoverPrimary bg-primary rounded-[4px] py-[2px] px-2 text-nowrap relative select-none text-white overflow-hidden">Browse
                    <input
                      className="absolute w-full h-full cursor-pointer top-0 right-0 z-10 opacity-0 file:cursor-pointer"
                      type="file"
                      title=" "
                      tabIndex={0}
                      accept=".jpg,.jpeg,.png,.gif"
                      onChange={handleChooseFile}
                    ></input>
                  </button>
                )
              }
            </div>
          </div>
          <div className={'w-1/2 flex flex-col gap-2'}>
            <p className={`text-xs font-bold uppercase select-none`}>Sticker Name</p>
            <div className={"bg-bgLightModeSecond dark:bg-bgTertiary border-[0.08px] dark:border-textLightTheme border-textDarkTheme flex flex-row rounded justify-between items-center p-2 pl-3 dark:text-textPrimary box-border overflow-hidden"}>
              <InputField type="string" placeholder="ex. cat hug" className={'px-[8px]'} value={editingSticker.shortname} onChange={handleChangeShortNameSticker} />
            </div>
          </div>
        </div>
      </div>
      <div className={`absolute w-full h-[54px] bottom-0 flex items-end justify-end select-none`}>
        <Button label="Never Mind" className="dark:text-textPrimary text-[#313338] rounded px-4 py-1.5 hover:underline hover:bg-transparent bg-transparent" onClick={handleCloseModal} />
        <Button label="Save Changes" className="bg-blue-600 rounded-[4px] px-4 py-1.5 text-nowrap text-white" onClick={handleCloseModal} />
      </div>
    </div >
  )
}

export default ModalSticker;

const PreviewStickerBox = ({ preview }: { preview: string }) => {
  return (
    <div className={'m-auto absolute w-40 aspect-square overflow-hidden flex items-center justify-end'}>
      <img className="h-full w-auto object-cover" src={preview} />
    </div>
  )
}
