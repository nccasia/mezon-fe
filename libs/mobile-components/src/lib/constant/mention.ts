export const mentionRegex = /(?<=\s|^)(@\[[^\]]+\]|<#\d+#[\w-]+>)(?=\s|$)/g;
export const mentionUserPattern = /@\[[^\]]*\]/g;
export const mentionHashtagPattern = /<#([^>]*)>/g;
export const mentionRegexSplit = /(@\[[^\]]+\]|<#\d+#[\w-]+>)/g;
