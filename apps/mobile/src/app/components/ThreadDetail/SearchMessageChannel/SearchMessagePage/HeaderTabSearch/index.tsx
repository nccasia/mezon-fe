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
		<Block flexDirection={'row'} justifyContent={'flex-start'} alignItems={'center'} borderBottomColor={Colors.borderDim} borderBottomWidth={1}>
			{tabList?.map((tab: ITabList, index: number) => (
				<Pressable key={index.toString()} onPress={() => onPress(tab?.index)}>
					<Block
						paddingHorizontal={size.s_20}
						paddingBottom={size.s_10}
						paddingVertical={size.s_20}
						borderBottomColor={Colors.bgViolet}
						borderBottomWidth={tab?.index === activeTab ? size.s_2 : 0}
					>
						<Text style={{ color: tab?.index === activeTab ? baseColor.blurple : themeValue.text }}>
							{tab.title} {tab?.quantitySearch ? `(${tab?.quantitySearch})` : ''}
						</Text>
					</Block>
				</Pressable>
			))}
		</Block>
	);
}

export default React.memo(HeaderTabSearch);
