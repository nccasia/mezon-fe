import { View,Text } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox/build/dist/BouncyCheckbox";
import { styles } from "../NotificationSetting.styles";
import { Colors } from "@mezon/mobile-ui";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ENotificationType } from "../../NotificationSetting";
import React from 'react';


interface FilterCheckboxProps {
  id: number;
  isChecked: boolean;
  label: string;
  defaultNotifyName: string,
  onCheckboxPress: (checked: boolean, id: number) => void;
}

const FilterCheckbox: React.FC<FilterCheckboxProps> = React.memo(({
  id,
  isChecked,
  label,
  defaultNotifyName,
  onCheckboxPress,
}) => {
  const handleCheckboxPress = () => {
    onCheckboxPress(!isChecked, id);
  };
  return (
    <TouchableOpacity onPress={handleCheckboxPress} style={styles.option}>
      <View>
        <Text style={styles.labelOption}>{label}</Text>
        {[ENotificationType.CATEGORY_DEFAULT].includes(label as ENotificationType) && <Text style={styles.defaultNotifyName}>{defaultNotifyName}</Text>}
      </View>
      <BouncyCheckbox
        size={20}
        fillColor={Colors.bgButton}
        isChecked={isChecked}
        innerIconStyle={{ borderWidth: 1.5, borderColor: isChecked ? Colors.bgButton : Colors.white }}
        textStyle={{ fontFamily: "JosefinSans-Regular",  textDecorationLine: "none", }}
      />
    </TouchableOpacity>
  );
});

export default FilterCheckbox;
