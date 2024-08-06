import { AngleLeft, ArrowLeftIcon, EOpenSearchChannelFrom, FilterSearchIcon, Icons } from '@mezon/mobile-components';
import { Colors, useTheme } from '@mezon/mobile-ui';
import { useNavigation } from '@react-navigation/native';
import { CircleXIcon } from 'libs/mobile-components/src/lib/icons2';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Tooltip from 'react-native-walkthrough-tooltip';
import ListOptionSearch from '../ListOptionSearch';
import { style } from './InputSearchMessageChannel.styles';

type InputSearchMessageChannelProps = {
	onChangeText: (value: string) => void;
	openSearchChannelFrom: EOpenSearchChannelFrom;
};

const InputSearchMessageChannel = ({ onChangeText, openSearchChannelFrom }: InputSearchMessageChannelProps) => {
	const [textInput, setTextInput] = useState<string>('');
	const [isIconClear, setIsIconClear] = useState<boolean>(false);
	const [isVisible, setIsVisible] = useState<boolean>(false);
	const navigation = useNavigation<any>();
	const { t } = useTranslation(['searchMessageChannel']);

	const { themeValue } = useTheme();
	const styles = style(themeValue);

	const handleTextChange = (e) => {
		onChangeText(e);
		setTextInput(e);
	};
	const clearTextInput = () => {
		setTextInput('');
		onChangeText('');
	};
	return (
		<View style={styles.wrapper}>
			<TouchableOpacity
				onPress={() => {
					navigation.goBack();
				}}
			>
				{openSearchChannelFrom === EOpenSearchChannelFrom.ActionMenu && <AngleLeft width={20} height={20} color={Colors.textGray} />}
				{openSearchChannelFrom === EOpenSearchChannelFrom.ChannelList && <ArrowLeftIcon width={20} height={20} color={Colors.textGray} />}
			</TouchableOpacity>
			<View style={styles.searchBox}>
				<View>
					<Icons.MagnifyingIcon width={20} height={20} color={Colors.textGray} />
				</View>
				<TextInput
					value={textInput}
					onChangeText={handleTextChange}
					style={styles.input}
					placeholderTextColor={Colors.textGray}
					placeholder={t('search')}
					autoFocus
				></TextInput>
				{!!textInput?.length ? (
					<Pressable onPress={() => clearTextInput()}>
						<CircleXIcon height={18} width={18} color={themeValue.text} />
					</Pressable>
				) : null}
			</View>
			<Tooltip
				isVisible={isVisible}
				closeOnBackgroundInteraction={true}
				disableShadow={true}
				closeOnContentInteraction={true}
				content={<ListOptionSearch />}
				contentStyle={{ minWidth: 220, padding: 0 }}
				arrowSize={{ width: 0, height: 0 }}
				placement="bottom"
				onClose={() => setIsVisible(false)}
			>
				<TouchableOpacity activeOpacity={0.7} onPress={() => setIsVisible(true)} style={styles.listSearchIcon}>
					<FilterSearchIcon width={20} height={20} color={themeValue.textStrong} />
				</TouchableOpacity>
			</Tooltip>
		</View>
	);
};

export default InputSearchMessageChannel;
