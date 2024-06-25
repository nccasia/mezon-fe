import { Colors } from "@mezon/mobile-ui";
import { View, Text } from "react-native";
import { styles } from "./ListOptionSearch.style";
import OptionSearch from "../OptionSearch";

export const searchOptions = [
	{ title: 'from:', content: 'user', value: 'username' },
	{ title: 'mentions:', content: 'user', value: 'username' },
	{ title: 'has:', content: 'link, embed or file', value: 'attachment' },
	{ title: 'before:', content: 'specific data', value: 'username' },
	{ title: 'during:', content: 'specific data', value: 'username' },
	{ title: 'after:', content: 'specific data', value: 'username' },
	{ title: 'pinned:', content: 'true or false', value: 'username' },
];
const ListOptionSearch = () =>{
  return (
    <View style={styles.optionSearchContainer}>
      <Text style={styles.headerTitle}>Filter results...</Text>
      {
        searchOptions.map((option, index)=>(
          <OptionSearch option={option} key={`${option.value}_${index}`}></OptionSearch>
        ))
      }
    </View>
  )
}

export default ListOptionSearch;
