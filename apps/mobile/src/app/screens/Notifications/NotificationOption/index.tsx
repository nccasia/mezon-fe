import { Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Colors } from '@mezon/mobile-ui'
import { styles as s } from './NotificationOption.styles'
import { EActionDataNotify } from '../types'
import { MuteIcon, SettingIcon, } from "@mezon/mobile-components";
import { useTranslation } from 'react-i18next'
import MezonToggleButton from '../../../temp-ui/MezonRadioButton'
import Toast from "react-native-toast-message";


const NotificationOption = ({onChange}) => {
  const { t } = useTranslation(['notification']);
  const tabDataNotify = [
    {id: 1, title: t('tabNotify.forYou'), value: 'individual', icon: <Text style={s.icon}>@</Text>  },
    {id: 2, title: t('tabNotify.mention'), value: 'mention', icon: <MuteIcon width={22} height={22} />  },
  ];
  const [selectedTabs, setSelectedTabs] = useState({ individual: true, mention: true });

  const handleTabChange = (value, isSelected) => {
    setSelectedTabs(prevState => ({
      ...prevState,
      [value]: isSelected
    }));
  };


  const calculateValue = () => {
    return selectedTabs.individual && selectedTabs.mention
      ? EActionDataNotify.All
      : selectedTabs.individual
      ? EActionDataNotify.Individual
      : selectedTabs.mention
      ? EActionDataNotify.Mention
      : null;
  };


  useEffect(() => {
    const value = calculateValue();
    onChange(value);
  }, [selectedTabs]);

    return (
        <View style={s.wrapperOption}>
            <Text style={s.headerTitle}>{t('headerTitle')}</Text>
            <View style={s.optionContainer}>{
              tabDataNotify.map((option)=>(
                <View key={option.id} style={s.option}>
                  {option.icon}
                  <Text style={s.textOption}>{option.title}</Text>
                  <MezonToggleButton onChange={(isSelected) => handleTabChange(option.value, isSelected)}
                  height={30} width={60}
                  toggleOnColor={Colors.white}
                  value={true}
                  toggleBgOffColor={Colors.gray48}
                  toggleBgOnColor={Colors.bgButton}
                  toggleOffColor={Colors.gray72}>
                  </MezonToggleButton>
                </View>
              ))
            }
            </View>
            <View style={s.notifySetting}>
            <TouchableOpacity style={s.option} onPress={() => Toast.show({ type: 'info', text1: 'Updating...'})}>
                <SettingIcon width={22} height={22} />
                <Text style={s.textOption}>{t('tabNotify.notificationSettings')}</Text>
            </TouchableOpacity>
            </View>
        </View >
    )
}

export default NotificationOption

