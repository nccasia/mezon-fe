import { useTheme } from '@mezon/mobile-ui';
import { ReactNode, useState } from 'react';
import { View } from 'react-native';
import MezonTabHeader from '../MezonTabHeader';
import MezonTabView from '../MezonTabView';
import { style } from './styles';

interface IMezonTabProps {
	views: ReactNode[];
	titles: string[];
}

export default function MezonTab({ views, titles }: IMezonTabProps) {
	const [tab, setTab] = useState<number>(0);
	const { themeValue } = useTheme();
	const styles = style(themeValue);

	function handleTabChange(index: number) {
		setTab(index);
	}

	return (
		<View style={styles.container}>
			<MezonTabHeader tabIndex={tab} onChange={handleTabChange} tabs={titles} />
			<MezonTabView pageIndex={tab} onChange={handleTabChange} views={views} />
		</View>
	);
}
