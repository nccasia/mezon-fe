
import { Text, View } from 'react-native'
import React from 'react'
import { mentionRegex, mentionRegexSplit } from '../../../../../utils/helpers';
import { styles } from './RenderTextContent.styles';


const renderTextWithMention = (text: string, matchesMention: RegExpMatchArray) => {
  const parts = text
    .split(mentionRegexSplit)
    .filter(Boolean)
    .filter((i) => i !== '@' && i !== '#');
  return parts.map((part, index) => {
    if (!part) return <View />;

    return (
      <Text
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        onTouchEnd={() => {
          if (matchesMention.includes(part)) {}
        }}
        key={index}
        style={matchesMention.includes(part) ? styles.contentMessageMention : styles.contentMessageBox}
      >
        {part}
      </Text>
    );
  });
};
export const renderTextContent = (text) => {
  const matchesMention = text.match(mentionRegex);
  if (matchesMention?.length) {
    return <Text>{renderTextWithMention(text, matchesMention) }</Text>;
  }
};
