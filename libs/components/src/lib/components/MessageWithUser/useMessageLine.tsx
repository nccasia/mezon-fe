import {IMessageLine} from '@mezon/utils';
import {useMemo} from 'react';
import {useSelector} from "react-redux";
import {selectChannelsEntities} from "@mezon/store";

export function useMessageLine(line: string): IMessageLine {
	const combinedRegex = /(?<!`)((?<=\s|^)(@)\S+(?=\s|$)|<#[^>`\s]+>|:[a-zA-Z0-9_]*:)(?!`)/g;
	const emojiRegex = /^:\w+:$/;
	const extensionsRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
  const googleMeetLinkRegex = /https:\/\/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/g;
  const extensionsNotGoogleMeetRegex = /https?:\/\/(?!meet\.google\.com)[^\s/$.?#].[^\s]*/gi;
  const channels = useSelector(selectChannelsEntities);

  const extractMeetingCodes = (input: string): string[] => {
    const matches = [...input.matchAll(googleMeetLinkRegex)];
    return matches.map(match => match[1]);
  }

  const transformGoogleMeetLinks = (input: string): string => {
    return input.replace(googleMeetLinkRegex, (match) => {
      const meetingCode = extractMeetingCodes(match)[0];
      if (!meetingCode) return match;

      const foundMeeting = Object.values(channels).find(channel => channel?.meeting_code === meetingCode);
      return foundMeeting ? `<#${foundMeeting.id}>` : match;
    });
  }
  
	const isOnlyEmoji = useMemo(() => {
		if (!line?.trim()) {
			return false;
		}
		return emojiRegex.test(line);
	}, [line]);

	const processMatches = (regex: RegExp, inputLine: string) => {
		let lastIndex = 0;
		let nonMatchText = inputLine;
		const matches = inputLine.match(regex) || [];

		const processedMatches = matches.map((match, i) => {
			const startIndex = inputLine.indexOf(match, lastIndex);
			const endIndex = startIndex + match.length;
			const matchedText = inputLine.substring(startIndex, endIndex);
			nonMatchText = inputLine.substring(lastIndex, startIndex);
			lastIndex = endIndex;
			return {
				nonMatchText,
				matchedText,
				startIndex,
				endIndex,
			};
		});

		if (processedMatches.length === 0) {
			return [
				{
					nonMatchText: nonMatchText,
					matchedText: '',
					startIndex: 0,
					endIndex: 0,
				},
			];
		}

		if (lastIndex < inputLine.length) {
			processedMatches.push({
				nonMatchText: inputLine.substring(lastIndex),
				matchedText: '',
				startIndex: lastIndex,
				endIndex: inputLine.length,
			});
		}

		return processedMatches;
	};

	const links = useMemo(() => {
		if (!line) {
			return [];
		}
		return processMatches(extensionsNotGoogleMeetRegex, line);
	}, [line, extensionsNotGoogleMeetRegex]);

	const mentions = useMemo(() => {
		if (!line) {
			return [];
		}
		const trimmedLine = line.trim();
		if ((trimmedLine.startsWith('```') && trimmedLine.endsWith('```')) || (trimmedLine.startsWith('`') && trimmedLine.endsWith('`'))) {
			return [
				{
					nonMatchText: line,
					matchedText: '',
					startIndex: 0,
					endIndex: line.length,
				},
			];
		}
    
    if(extractMeetingCodes(line).length) {
      return processMatches(combinedRegex, transformGoogleMeetLinks(line));
    }
		return processMatches(combinedRegex, line);
	}, [line, combinedRegex]);

	return {
		mentions,
		isOnlyEmoji,
		links,
	};
}
