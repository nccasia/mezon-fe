import { Block, size } from '@mezon/mobile-ui';
import Toast from 'react-native-toast-message';
import { IMezonMenuItemProps } from './MezonMenuItem';
import MezonMenuSection, { IMezonMenuSectionProps } from './MezonMenuSection';

interface IMezonMenu {
	menu: IMezonMenuSectionProps[];
	marginVertical?: number | null;
}

export default function MezonMenu({ menu, marginVertical = size.s_18 }: IMezonMenu) {
	return (
		<Block gap={size.s_12} paddingBottom={size.s_18} marginVertical={marginVertical}>
			{menu.map((item, index) => (
				<MezonMenuSection key={index.toString()} {...item} />
			))}
		</Block>
	);
}

export const reserve = () => {
	Toast.show({
		type: 'info',
		text1: 'Coming soon'
	});
};

export { IMezonMenuItemProps, IMezonMenuSectionProps };
