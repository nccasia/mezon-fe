import { AngleLeft, ArrowLeftIcon, EOpenSearchChannelFrom, FilterSearchIcon, Icons, IOption } from '@mezon/mobile-components';
import { Block, Colors, size, useTheme } from '@mezon/mobile-ui';
import { useNavigation } from '@react-navigation/native';
import { CircleXIcon } from 'libs/mobile-components/src/lib/icons2';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Tooltip from 'react-native-walkthrough-tooltip';
import ListOptionSearch from '../ListOptionSearch';
import { style } from './InputSearchMessageChannel.styles';
import { useRef } from 'react';
import { useEffect } from 'react';

type InputSearchMessageChannelProps = {
	onChangeText: (value: string) => void;
	openSearchChannelFrom: EOpenSearchChannelFrom;
  onChangeOptionFilter: (option: IOption) => void;
  inputValue: string;
  userMention: any
};

const InputSearchMessageChannel = ({ onChangeText, openSearchChannelFrom, onChangeOptionFilter , inputValue, userMention}: InputSearchMessageChannelProps) => {
	const [textInput, setTextInput] = useState<string>(inputValue);
	const [isIconClear, setIsIconClear] = useState<boolean>(false);
	const [isVisibleToolTip, setIsVisibleToolTip] = useState<boolean>(false);
  const inputSearchRef = useRef(null);
  const [optionFilter, setOptionFilter] = useState<IOption>();
	const navigation = useNavigation<any>();
	const { t } = useTranslation(['searchMessageChannel']);

	const { themeValue } = useTheme();
	const styles = style(themeValue);

	const handleTextChange = (e) => {
		onChangeText(e);
		setTextInput(e);
    if(!e?.length ) {
      onChangeOptionFilter(null);
    }
	};
	const clearTextInput = () => {
		setTextInput('');
		onChangeText('');
    onChangeOptionFilter(null);
	};

  useEffect(()=>{
    if(optionFilter && userMention) {
      const textInput = `${optionFilter?.title} ${userMention?.display} `
      setTextInput(textInput)
      onChangeText(textInput)
    }

  },[userMention])
	return (
		<View style={styles.wrapper}>
			<TouchableOpacity
				onPress={() => {
					navigation.goBack();
				}}
			>
				<ArrowLeftIcon width={20} height={20} color={Colors.textGray} />
			</TouchableOpacity>
			<View style={styles.searchBox}>
				<View>
					<Icons.MagnifyingIcon width={20} height={20} color={Colors.textGray} />
				</View>
				<TextInput
          ref={inputSearchRef}
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
				isVisible={isVisibleToolTip}
				closeOnBackgroundInteraction={true}
				disableShadow={true}
				closeOnContentInteraction={true}
				content={<ListOptionSearch onPressOption={(option)=>{
          onChangeOptionFilter(option)
		      setTextInput(option.title);
          onChangeText(option.title)
          setOptionFilter(option);
          if (inputSearchRef.current) {
            inputSearchRef.current.focus();
          }
          setIsVisibleToolTip(false)}} />}
				contentStyle={{ minWidth: 220, padding: 0, borderRadius: size.s_10, backgroundColor: Colors.primary }}
				arrowSize={{ width: 0, height: 0 }}
				placement="bottom"
				onClose={() => setIsVisibleToolTip(false)}
			>
				<TouchableOpacity activeOpacity={0.7} onPress={() =>{
           setIsVisibleToolTip(true)
           if (inputSearchRef.current) {
            inputSearchRef.current.focus();
          }
        }} style={styles.listSearchIcon}>
					<FilterSearchIcon width={20} height={20} color={themeValue.textStrong} />
				</TouchableOpacity>
			</Tooltip>
		</View>
	);
};

export default InputSearchMessageChannel;
