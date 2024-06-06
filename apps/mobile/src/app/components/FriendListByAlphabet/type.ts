import { FriendsEntity } from "@mezon/store-mobile";
import { EFriendItemAction } from "../FriendItem";

export interface IListUserByAlphabetProps {
    friendList: FriendsEntity[];
    isSearching: boolean;
    showAction?: boolean;
    selectMode?: boolean;
    onSelectedChange?: (friendIdSelectedList: string[]) => void;
    handleFriendAction: (friend: FriendsEntity, action: EFriendItemAction) => void
}

export interface IFriendGroupByCharacter {
    character: string;
    friendList: FriendsEntity[];
}