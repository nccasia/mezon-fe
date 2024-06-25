import { AngleLeft, CircleXMark, ListSearchIcon, SearchIcon } from '@mezon/mobile-components';
import { Colors } from '@mezon/mobile-ui';
import { useEffect, useState } from 'react';
import { Pressable, TextInput, View , Text} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Tooltip from 'react-native-walkthrough-tooltip';
import ListOptionSearch from './ListOptionSearch';
import { styles } from './SearchMessageChannel.style';
import { useNavigation } from '@react-navigation/native';

const SearchMessageChannel = () => {
	const [textInput, setTextInput] = useState<string>('');
	const [isIconClear, setIsIconClear] = useState<boolean>(false);
	const [isVisible, setIsVisible] = useState<boolean>(false);
	const navigation = useNavigation<any>();

	useEffect(() => {
		console.log('text: ', textInput);
	}, [textInput]);

	const handleTextChange = (e) => {
		setTextInput(e);
		setIsIconClear(true);
	};
	const clearTextInput = () => {
		setTextInput('');
		setIsIconClear(false);
	};
	return (
		<View style={styles.wrapper}>
        <TouchableOpacity onPress={()=>{navigation.goBack()}}>
        <AngleLeft width={20} height={20} color={Colors.textGray} />
        </TouchableOpacity>
			<View style={styles.searchBox}>
				<View>
					<SearchIcon width={20} height={20} color={Colors.textGray} />
				</View>
				<TextInput
					value={textInput}
					onChangeText={handleTextChange}
					style={styles.input}
					placeholderTextColor={Colors.textGray}
					placeholder="Search"
				></TextInput>
				{isIconClear ? (
					<Pressable onPress={() => clearTextInput()}>
						<CircleXMark width={20} height={20} color={Colors.textGray} />
					</Pressable>
				) : null}
			</View>
			<Tooltip
				isVisible={isVisible}
				closeOnBackgroundInteraction={true}
				disableShadow={true}
				closeOnContentInteraction={true}
				content={<ListOptionSearch />}
				contentStyle={{ backgroundColor: 'red', minWidth: 220, padding: 0}}
        arrowSize={{width: 0, height: 0}}
				placement="bottom"
				onClose={() => setIsVisible(false)}
			>
				<TouchableOpacity activeOpacity={0.7} onPress={()=> setIsVisible(true)} style={styles.listSearchIcon}>
					<ListSearchIcon width={20} height={20} color={Colors.textGray} />
				</TouchableOpacity>
			</Tooltip>
		</View>
	);
};

export default SearchMessageChannel;
