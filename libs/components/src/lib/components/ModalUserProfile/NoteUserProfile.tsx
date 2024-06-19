function NoteUserProfile() {
    return (
        <div className="flex flex-col">
            <div className="font-bold tracking-wider text-xs mb-1 pt-2">NOTE</div>
            <input
                placeholder="Click to add a note"
                className={`font-[400] px-[16px] rounded dark:text-white text-black outline-none text-[14px] w-full dark:bg-bgTertiary bg-[#E1E1E1] dark:border-borderDefault h-[36px]`}
                type="text"
            />
		</div>
    );
}

export default NoteUserProfile;