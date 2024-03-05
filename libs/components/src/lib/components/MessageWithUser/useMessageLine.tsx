import { useMemo } from "react";


// TODO: refactor this to sender function
const mentionRegex = /(@\S+?)\s/g;

export type ILineMention = {
    nonMatchText:  string;
    matchedText: string;
    startIndex: number;
    endIndex: number;
}

export type IMessageLine = {
    mentions: ILineMention[]
}

export function useMessageLine(line: string): IMessageLine {
    const matches = useMemo(() => line.match(mentionRegex) || [], [line]);

    const mentions = useMemo(() => {
        let lastIndex = 0;
        let nonMatchText = line;
        
        let mentions = matches.map((match, i) => {
          const startIndex = line.indexOf(match, lastIndex);
          const endIndex = startIndex + match.length;          
          const matchedText = line.substring(startIndex, endIndex);
          nonMatchText = line.substring(lastIndex, startIndex);
          lastIndex = endIndex;
    
          return {
            nonMatchText,
            matchedText,
            startIndex,
            endIndex
          };
        });
        if (mentions.length === 0) { // not match mention
          return [{
            nonMatchText:nonMatchText,
            matchedText:'',
            startIndex:0,
            endIndex:0
          }];
        }

        return mentions;

      }, [line, matches]);

    return {
        mentions
    }
}