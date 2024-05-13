import TestThemeBlock from './TestThemeBlock';
import ThemeOptions from './ThemeOptions';

const SettingAppearance = () => {
    return (
        <div className="overflow-y-auto flex flex-col flex-1 shrink bg-bgPrimary w-1/2 pt-[94px] pb-7 pr-[10px] pl-[40px] overflow-x-hidden min-w-[700px] 2xl:min-w-[900px] max-w-[740px] hide-scrollbar">
            <TestThemeBlock />
            <ThemeOptions />
        </div>
    );
};

export default SettingAppearance;
export { default as TestThemeBlock} from './TestThemeBlock';
export { default as ThemeOptions} from './ThemeOptions';