import { MentionDataProps } from '@mezon/utils';
import { FC } from 'react';
import { Pressable } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import SuggestItem from './SuggestItem';


export interface MentionSuggestionsProps {
  suggestions: MentionDataProps[];
  keyword?: string;
  onSelect: (user: MentionDataProps) => void;
}

const Suggestions: FC<MentionSuggestionsProps> = ({
  keyword,
  onSelect,
  suggestions
}) => {
  if (keyword == null) {
    return null;
  }
  suggestions = suggestions.map(item =>(
    {
      ...item,
      name: item.display
    }
  ))
  const handleSuggestionPress = (user: MentionDataProps) => {
    onSelect(user as MentionDataProps);
  };
  return (
      <FlatList
            style={{maxHeight: 200}}
            data={suggestions?.filter(item => item?.name.toLocaleLowerCase().includes(keyword?.toLocaleLowerCase()))}
            renderItem={({item}) => <Pressable onPress={()=> handleSuggestionPress(item)}>
            <SuggestItem isDisplayDefaultAvatar={true} name={item.display ?? ''} avatarUrl={(item).avatarUrl} subText="" />
            </Pressable>
          }
            keyExtractor={(_, index) => index.toString()}
            onEndReachedThreshold={0.1}
            keyboardShouldPersistTaps="handled"
          />
  );
};

export type ChannelsMention = {
	id: string;
	display: string;
	subText: string;
  name?: string;
};

export interface MentionHashtagSuggestionsProps {
  readonly listChannelsMention?: ChannelsMention[];
  keyword?: string;
  onSelect: (user: MentionDataProps) => void;
}

const HashtagSuggestions: FC<MentionHashtagSuggestionsProps> = ({
  keyword,
  onSelect,
  listChannelsMention
}) => {
  if (keyword == null) {
    return null;
  }
  listChannelsMention = listChannelsMention.map(item =>(
    {
      ...item,
      name: item.display
    }
  ))

  const handleSuggestionPress = (channel: ChannelsMention) => {
    onSelect(channel);
  };

  return (
    <FlatList
            style={{maxHeight: 200}}
            data={listChannelsMention?.filter(item => item?.name.toLocaleLowerCase().includes(keyword?.toLocaleLowerCase()))}
            renderItem={({item}) => <Pressable onPress={()=> handleSuggestionPress(item)}>
            <SuggestItem isDisplayDefaultAvatar={false} name={item.display ?? ''} symbol="#" subText={(item as ChannelsMention).subText} />
            </Pressable>
          }
            keyExtractor={(_, index) => index.toString()}
            onEndReachedThreshold={0.1}
            keyboardShouldPersistTaps="handled"
          />
  );
};

export { Suggestions , HashtagSuggestions}
