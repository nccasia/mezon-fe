import { ITabList } from '@mezon/mobile-components';
import { baseColor, Block, Colors, size, useTheme } from '@mezon/mobile-ui';
import React from 'react';
import { Pressable, Text } from 'react-native';
interface IHeaderTabSearchProps {
	onPress: (index: number) => void;
	tabList: ITabList[];
	activeTab: number;
}
function HeaderTabSearch({ onPress, tabList, activeTab }: IHeaderTabSearchProps) {
	const { themeValue } = useTheme();

	return (
		<Block flexDirection={'row'} justifyContent={'flex-start'} alignItems={'center'}>
			{tabList?.map((tab: ITabList, index: number) => (
				<Pressable key={index.toString()} onPress={() => onPress(index)}>
					<Block padding={size.s_20} paddingRight={0} paddingBottom={size.s_10} paddingVertical={size.s_20}>
						<Text style={{ color: index === activeTab ? baseColor.blurple : themeValue.text }}>
							{tab.title} {tab?.quantitySearch ? `(${tab?.quantitySearch})` : ''}
						</Text>
						{index === activeTab && <Block backgroundColor={Colors.bgViolet} height={size.s_2} top={size.s_8} />}
					</Block>
				</Pressable>
			))}
		</Block>
	);
}

export default React.memo(HeaderTabSearch);
