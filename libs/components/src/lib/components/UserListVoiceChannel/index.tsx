function UserListVoiceChannel() {
	// const a = useSelector(selectNewestUserJoinedVoice);
	// console.log(a)

	const data = {
		userAvt: 'https://fastly.picsum.photos/id/684/200/300.jpg?hmac=nn1tmB9fSTQO4MaL20HOedMOv4HNILJxIjPvOPhuxbE',
		userName: 'Phong-K',
	};

	return (
		<>
			<div className="hover:bg-[#36373D] w-[90%] flex p-1 ml-5 items-center gap-2 cursor-pointer rounded-sm">
				<div className="">
					<img className="w-5 h-5 rounded-full" src={data.userAvt} alt={data.userAvt}></img>
				</div>
				<div>
					<p>{data.userName}</p>
				</div>
			</div>
		</>
	);
}

export default UserListVoiceChannel;
