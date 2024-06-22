import { useEffect, useState } from 'react';
import { Icons } from '../../../components';
import { useApp } from '@mezon/core';
import { useSelector } from 'react-redux';
import { selectTheme } from '@mezon/store';

const ThemeOptions = () => {
	const appearanceTheme = useSelector(selectTheme);
	const { setAppearanceTheme, systemIsDark } = useApp();
	const [themeChosen, setThemeChosen] = useState<string>(appearanceTheme);

	const onWindowMatch = () =>{
		if(themeChosen === "system"){
			if(systemIsDark.matches){
				setAppearanceTheme("dark");
			}else{
				setAppearanceTheme("light");
			}
		}
	}
	useEffect(() => {
		onWindowMatch();
		const handleChange = () => {
			onWindowMatch();
		};
		systemIsDark.addEventListener('change', handleChange);
		return () => {
			systemIsDark.removeEventListener('change', handleChange);
		};
	}, [themeChosen, systemIsDark]);

    useEffect(()=>{
		if(themeChosen !== "system"){
			setAppearanceTheme(themeChosen);
		}
	}, [themeChosen, appearanceTheme, setAppearanceTheme]);

	return (
		<div className="pt-10">
			<div className='dark:text-white text-black'>Theme</div>
			<div className="theme-container flex gap-[30px] mt-3">
				<div
					className={`light-theme aspect-square bg-white w-[60px] rounded-full border dark:border-white border-black border-solid cursor-pointer relative ${themeChosen === 'light' ? 'border-indigo-600 border-2': ''}`}
					onClick={() => setThemeChosen('light')}
				>
					<div className={`checked-theme w-fit p-[2px] bg-indigo-600 absolute top-0 right-0 rounded-full ${themeChosen === 'light' ? 'block' : 'hidden'}`}>
						<Icons.CheckIcon />
					</div>
				</div>
				<div
					className={`dark-theme aspect-square bg-bgSecondary w-[60px] rounded-full border border-solid cursor-pointer relative ${themeChosen === 'dark' ? 'border-indigo-600 border-2': ''}`}
					onClick={() => setThemeChosen('dark')}
				>
					<div className={`checked-theme w-fit p-[2px] bg-indigo-600 absolute top-0 right-0 rounded-full ${themeChosen === 'dark' ? 'block' : 'hidden'}`}>
						<Icons.CheckIcon />
					</div>
				</div>
				<div
					className={`system-theme aspect-square bg-bgSecondary w-[60px] rounded-full border border-solid cursor-pointer flex justify-center items-center relative ${themeChosen === 'system' ? 'border-indigo-600 border-2': ''}`}
					onClick={() => setThemeChosen('system')}
				>
					<Icons.SpinArrowIcon />
					<div className={`checked-theme w-fit p-[2px] bg-indigo-600 absolute top-0 right-0 rounded-full ${themeChosen === 'system' ? 'block' : 'hidden'}`}>
						<Icons.CheckIcon />
					</div>
				</div>
			</div>
		</div>
	);
};

export default ThemeOptions;