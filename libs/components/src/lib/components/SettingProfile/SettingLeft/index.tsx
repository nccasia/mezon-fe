import { authActions, useAppDispatch } from "@mezon/store";
import { LogOutButton, LogoutModal } from "libs/ui/src/lib/LogOutButton";
import React, { useState } from "react";
const SettingItem = ({
  onItemClick,
}: {
  onItemClick?: (settingName: string) => void;
}) => {
  const [selectedButton, setSelectedButton] = useState<string | null>(
    "Account",
  );
  const handleButtonClick = (buttonName: string) => {
    setSelectedButton(buttonName);
  };
  const [openModal, setOpenModal] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const handleOpenModal = () => {
    setOpenModal(true);
  };
  const handleLogOut = () => {
    dispatch(authActions.logOut());
  };
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedButton("");
  };
  return (
    <div className="hidden overflow-y-auto w-1/4 bg-black md:block pt-96 pl-[142px] pr-[16px] pb-[96px] scrollbar-thin scrollbar-thumb-black scrollbar-track-gray-200">
      <div className="w-170px ">
        <p className="text-blue-500 ">USER SETTINGS</p>
        <button
          className={`pt-1 pl-1 text-white w-[170px] rounded-[5px] text-left mt-[16px] ${selectedButton === "Account" ? "bg-blue-400" : ""}`}
          onClick={() => {
            handleButtonClick("Account");
            onItemClick && onItemClick("Account");
          }}
        >
          My Account
        </button>
        <br />
        <button
          className={`pt-1 pl-1 text-white ${selectedButton === "Profiles" ? "bg-blue-400" : ""} mt-[16px] w-[170px] text-left rounded-[5px]`}
          onClick={() => {
            handleButtonClick("Profiles");
            onItemClick && onItemClick("Profiles");
          }}
        >
          Profiles
        </button>
        <br />
        <button className="pt-1 pl-1 text-white w-[170px] rounded-[5px] text-left mt-[16px]">
          Privacy & Safety
        </button>
        <br />
        <button className="pt-1 pl-1 text-white w-[170px] rounded-[5px] text-left mt-[16px]">
          Family Center
        </button>
        <br />
        <button className="pt-1 pl-1 text-white w-[170px] rounded-[5px] text-left mt-[16px]">
          Family Center
        </button>
        <br />
        <button className="pt-1 pl-1 text-white w-[170px] rounded-[5px] text-left mt-[16px]">
          Authorized Apps
        </button>
        <br />
        <button className="pt-1 pl-1 text-white w-[170px] rounded-[5px] text-left mt-[16px]">
          Devices
        </button>
        <br />
        <button className="pt-1 pl-1 text-white w-[170px] rounded-[5px] text-left mt-[16px]">
          Connections
        </button>
        <br />
        <button className="pt-1 pl-1 text-white w-[170px] rounded-[5px] text-left mt-[16px]">
          Clips
        </button>
        <br />
        <button className="pt-1 pl-1 text-white mb-[10px] w-[170px] rounded-[5px] text-left mt-[16px]">
          Friend Requests
        </button>
        <hr className="border-t-1 border-#1E1E1E" />
        <button className="pt-2 text-blue-500 mt-[16px]">USER SETTINGS</button>
        <br />
        <button className="pt-1 pl-1 text-white w-[170px] rounded-[5px] text-left mt-[16px]">
          Appearance
        </button>
        <br />
        <button className="pt-1 pl-1 text-white w-[170px] rounded-[5px] text-left mt-[16px]">
          Accessibility
        </button>
        <br />
        <button className="pt-1 pl-1 text-white w-[170px] rounded-[5px] text-left mt-[16px]">
          Voice & Video
        </button>
        <br />
        <button className="pt-1 pl-1 text-white w-[170px] rounded-[5px] text-left mt-[16px]">
          Text & Image
        </button>
        <br />
        <button className="pt-1 pl-1 text-white w-[170px] rounded-[5px] text-left mt-[16px]">
          Notifications
        </button>
        <br />
        <button className="pt-1 pl-1 text-white w-[170px] rounded-[5px] text-left mt-[16px]">
          Keybinds
        </button>
        <br />
        <button className="pt-1 pl-1 text-white w-[170px] rounded-[5px] text-left mt-[16px]">
          Language
        </button>
        <br />
        <button className="pt-1 pl-1 text-white w-[170px] rounded-[5px] text-left mt-[16px]">
          Streamer Mode
        </button>
        <br />
        <button className="pt-1 pl-1 text-white w-[170px] rounded-[5px] text-left mt-[16px]">
          Advanced
        </button>
        <br />
        <button
          className={`pt-1 pl-1 text-white ${selectedButton === "LogOut" ? "bg-blue-400" : ""} mt-[16px] w-[170px] text-left rounded-[5px]`}
          onClick={() => {
            handleButtonClick("LogOut");
            handleOpenModal();
          }}
        >
          LogOut
        </button>
        <LogoutModal
          isOpen={openModal}
          handleLogOut={handleLogOut}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
};

export default SettingItem;
