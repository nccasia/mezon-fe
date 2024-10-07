import { useTheme } from '@mezon/mobile-ui';
import { ReactNode, useState } from 'react';
import { Pressable, View } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import MezonMenuContextItem, { IMezonMenuContextItemProps } from './MezonMenuContextItem';
import { style } from './styles';

interface IMezonMenuContext {
	icon: ReactNode;
	headerTitle?: string;
	menu: IMezonMenuContextItemProps[];
}
export default function MezonMenuContext({ icon, headerTitle, menu }: IMezonMenuContext) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const [isVisible, setVisible] = useState<boolean>(false);

	function onItemPress(onPress?: () => void) {
		setVisible(false);
		onPress && onPress();
	}

	return (
		<Tooltip
			isVisible={isVisible}
			closeOnBackgroundInteraction={true}
			disableShadow={true}
			closeOnContentInteraction={true}
			content={
				<View>
					{!!headerTitle && <MezonMenuContextItem isHeader title={headerTitle} disabled />}
					{menu.map((item, index) => (
						<MezonMenuContextItem
							key={index.toString() + item.title}
							hasBorder={index !== menu.length - 1}
							{...item}
							onPress={() => onItemPress(item.onPress)}
						/>
					))}
				</View>
			}
			contentStyle={styles.container}
			arrowSize={styles.arrow}
			placement="bottom"
			onClose={() => setVisible(false)}
		>
			<Pressable onPress={() => setVisible(true)}>{icon}</Pressable>
		</Tooltip>
	);
}

export { IMezonMenuContextItemProps };
