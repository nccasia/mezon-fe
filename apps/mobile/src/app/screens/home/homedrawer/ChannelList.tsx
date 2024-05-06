import { useCategory } from '@mezon/core';
import { selectCurrentClan } from '@mezon/store-mobile';
import React from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Feather from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';
import Dots from '../../../../assets/svg/guildMoreOptions1.svg';
import { darkColor } from '../../../constants/Colors';
import { useAnimatedState } from '../../../hooks/useAnimatedState';
import { Colors } from '../../../themes';
import { ChannelListContext, ChannelListSection } from './Reusables';
import { styles } from './styles';

const ChannelList = React.memo((props: any) => {
	const currentClan = useSelector(selectCurrentClan);
	const { categorizedChannels } = useCategory();

	const [collapseChannelItems, setCollapseChannelItems] = useAnimatedState([]);

	const toggleCollapseChannel = (index: string) => {
		if (collapseChannelItems.includes(index)) {
			setCollapseChannelItems(collapseChannelItems.filter((item) => item !== index)); // Collapse if already Collapse
		} else {
			setCollapseChannelItems([...collapseChannelItems, index]); // Expand if not Collapse
		}
	};
	return (
		<ChannelListContext.Provider value={{ navigation: props.navigation }}>
			<View style={[styles.mainList, { backgroundColor: '#232323' }]}>
				<ServerListHeader title={currentClan?.clan_name} />
				<View style={styles.channelListSearch}>
					<View style={styles.channelListSearchWrapperInput}>
						<Feather size={18} name="search" style={{ color: Colors.black }} />
						<TextInput placeholder={'Search'} placeholderTextColor={Colors.textGray} style={styles.channelListSearchInput} />
					</View>
					<View
						style={{
							alignItems: 'center',
							justifyContent: 'center',
							display: 'flex',
							borderRadius: 50,
							backgroundColor: darkColor.Border_Focus,
							width: 30,
							height: 30,
						}}
					>
						<Feather size={16} name="user-plus" style={{ color: darkColor.Backgound_Subtle }} />
					</View>
				</View>
				<FlatList
					data={categorizedChannels || []}
					renderItem={({ item, index }) => (
						<ChannelListSection data={item} index={index} onPressHeader={toggleCollapseChannel} collapseItems={collapseChannelItems} />
					)}
				/>
			</View>
		</ChannelListContext.Provider>
	);
});

const ServerListHeader = React.memo((props: { title: string }) => {
	return (
		<TouchableOpacity style={styles.listHeader}>
			<Text style={styles.titleHeaderChannel}>{props.title}</Text>
			<Dots width={30} height={30} />
		</TouchableOpacity>
	);
});

export default ChannelList;
