import { Button, Modal } from "@mezon/ui";
import { useState } from "react";
import { Icons } from "../../../components";
import ModalSticker from "./ModalEditSticker";
import SettingStickerItem from "./SettingStickerItem";


export interface ISticker {
  id: string,
  source: string,
  shortname: string,
  category: string,
  creatorId: string,
  createTime: string,
  clanId: string
}

const stickers: ISticker[] = [
  {
    id: "1",
    source: "https://cdn.mezon.vn/1809615577312923648/1809615577329700864/17218963672241721896367224.png",
    shortname: "Number One",
    category: "Emojis",
    creatorId: "user123",
    createTime: "2024-07-26T03:34:30.638Z",
    clanId: "clan123",
  },
  {
    id: "2",
    source: "https://cdn.mezon.vn/1809615577312923648/1809615577329700864/17218152958651721815295864.png",
    shortname: "Number Two",
    category: "Emojis",
    creatorId: "user123",
    createTime: "2024-07-26T03:34:30.638Z",
    clanId: "clan123",
  },
  {
    id: "3",
    source: "https://cdn.mezon.vn/1809615577312923648/1809615577329700864/17218964424771721896442476.png",
    shortname: "Number Three",
    category: "Emojis",
    creatorId: "user123",
    createTime: "2024-07-26T03:34:30.638Z",
    clanId: "clan123",
  },

];

const SettingSticker = () => {
  const [showModalSticker, setShowModalSticker] = useState<boolean>(false);
  const [editSticker, setEditSticker] = useState<ISticker | null>(null);
  const handleDeleteSticker = (sticker: ISticker) => {
    // console.log(id);
  }
  const handleUpdateSticker = (sticker: ISticker) => {
    setEditSticker(sticker);
    setShowModalSticker(true);
  }
  const handleCloseModal = () => {
    setShowModalSticker(false);
    setEditSticker(null)
  }
  const handleOpenModalUpload = () => {
    setShowModalSticker(true);
  }
  return (
    <>
      <div className="flex flex-col gap-6 pb-[40px] dark:text-textSecondary text-textSecondary800 text-sm">
        <div className="flex flex-col gap-2 pb-6 border-b-[0.08px]  dark:border-borderDividerLight border-bgModifierHoverLight">
          <p className="font-bold text-xs uppercase"> UPLOAD INSTRUCTIONS </p>
          <p> Stickers can be static (PNG) or animated (APNG, GIF). Stickers must be exactly 320 x 320 pixels and no larger than 512KB. We will automatically resize static PNG and animated GIF stickers for you. </p>
        </div>
        <div className="flex p-4 dark:bg-bgSecondary bg-bgLightSecondary rounded-lg">
          <div className="flex-1 w-full flex flex-col">
            <p className="text-base font-bold">Free Slots</p>
            <p className="text-xs ">1 of 250 slots available</p>
          </div>
          <Button label="upload sticker" className="capitalize" onClick={handleOpenModalUpload}></Button>
        </div>
        <div className="w-full flex flex-wrap gap-y-5 lg:gap-x-[calc((100%_-_116px_*_5)/4)] gap-x-[calc((100%_-_116px_*_4)/3)] w">
          {
            stickers.map(sticker => (
              <SettingStickerItem key={sticker.id} sticker={sticker} deleteSticker={handleDeleteSticker} updateSticker={handleUpdateSticker} />
            ))
          }
          <div onClick={handleOpenModalUpload} className={'cursor-pointer group relative text-xs w-[116px] h-[140px] rounded-lg flex flex-col items-center p-3 border-[0.08px] border-dashed  dark:border-borderDivider border-spacing-2 border-bgTertiary justify-center'}>
            <Icons.ImageUploadIcon className="w-7 h-7 group-hover:scale-110 ease-in-out duration-75" />
          </div>
        </div>
      </div>
      <Modal showModal={showModalSticker} onClose={handleCloseModal} classNameBox={"max-w-[600px]"} children={<ModalSticker key={editSticker?.id} editSticker={editSticker} handleCloseModal={handleCloseModal} />} />

    </>
  )
}

export default SettingSticker;
