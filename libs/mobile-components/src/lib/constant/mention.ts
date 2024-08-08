export const mentionRegex = /(?<=\s|^)(@\[[^\]]+\]|<#\d+>)(?=\s|$)/g;
export const mentionUserPattern = /@\[[^\]]*\]/g;
export const mentionHashtagPattern = /<#([^>]*)>/g;
export const mentionRegexSplit = /(@\[[^\]]+\]|<#\d+>)/g;
