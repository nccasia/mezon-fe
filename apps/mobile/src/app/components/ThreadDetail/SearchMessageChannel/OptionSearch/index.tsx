import { NittroIcon, UserIcon } from "@mezon/mobile-components";
import { View, Text } from "react-native";
import { styles } from "./OptionSearch.style";

type Option ={ option: {title: string, content: string, value: string} }
const OptionSearch = ({option}: Option ) =>{
  return (
    <View style={styles.wrapperOption}>
       <View style={styles.content}>
       <Text numberOfLines={1} ellipsizeMode="tail" style={styles.textOption}>{option?.title}</Text>
       <Text numberOfLines={1} ellipsizeMode="tail" style={styles.textOption}>{option?.content}</Text>
       </View>
       <NittroIcon />
    </View>
  )
 }

export default OptionSearch;
