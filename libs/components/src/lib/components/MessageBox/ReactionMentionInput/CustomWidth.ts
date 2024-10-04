const clanWidth = '72px';
const channelListWidth = '272px';
const memberWidth = '245px';
const memberWidthThread = '500px';
const widthResultSearch = '420px';
const margin = '16px';
const dmUserProfile = '340px';
const dmGroupMemberList = '241px';

export const widthMessageViewChat = `calc(100vw - ${clanWidth} - ${channelListWidth} - ${memberWidth} - ${margin})`;
export const widthMessageViewChatThread = `calc(100vw - ${clanWidth} - ${channelListWidth} - ${memberWidthThread} - ${margin})`;
export const widthThumbnailAttachment = `calc(100vw - ${clanWidth} - ${channelListWidth} - ${margin})`;
export const widthSearchMessage = `calc(100vw - ${clanWidth} - ${channelListWidth} - ${widthResultSearch} - ${margin})`;
export const widthDmUserProfile = `calc(100vw - ${clanWidth} - ${channelListWidth} - ${dmUserProfile} - ${margin})`;
export const widthDmGroupMemberList = `calc(100vw - ${clanWidth} - ${channelListWidth} - ${dmGroupMemberList} - ${margin})`;

//react mention input max width
const uploadBtnChatBox = '32px';
const messageBoxGap = '20px';
const messageBoxBtnGroup = '80px';
const xMarginOfMessageBox = '16px';
const spaceOfOthersElement = `(${uploadBtnChatBox} + ${messageBoxGap} + ${messageBoxBtnGroup} + ${xMarginOfMessageBox})`;

export const defaultMaxWidth = `calc(100vw - ${clanWidth} - ${channelListWidth} - ${margin} - ${spaceOfOthersElement})`;
export const maxWidthWithMemberList = `calc(100vw - ${clanWidth} - ${channelListWidth} - ${memberWidth} - ${margin} - ${spaceOfOthersElement})`;
export const maxWidthWithChatThread = `calc(100vw - ${clanWidth} - ${channelListWidth} - ${memberWidthThread} - ${margin} - ${spaceOfOthersElement})`;
export const maxWidthWithSearchMessage = `calc(100vw - ${clanWidth} - ${channelListWidth} - ${widthResultSearch} - ${margin} - ${spaceOfOthersElement})`;
export const maxWidthWithDmUserProfile = `calc(100vw - ${clanWidth} - ${channelListWidth} - ${dmUserProfile} - ${margin} - ${spaceOfOthersElement})`;
export const maxWidthWithDmGroupMemberList = `calc(100vw - ${clanWidth} - ${channelListWidth} - ${dmGroupMemberList} - ${margin} - ${spaceOfOthersElement})`;
