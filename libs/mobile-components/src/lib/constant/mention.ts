export const mentionRegex = /(?<=\s|^)(@\[[^\]]+\]|<#[-\w\s]+>)(?=\s|$)/g;
export const mentionUserPattern = /@\[[^\]]*\]/g;
export const mentionHashtagPattern = /<#([^>]*)>/g;
export const mentionRegexSplit = /(@\[[^\]]+\]|<#[-\w\s]+>|:\w+:)/g;
