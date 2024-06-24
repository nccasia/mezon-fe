import { OptionEvent } from "@mezon/utils";
import { CompositeNavigationProp, CompositeScreenProps, NavigatorScreenParams, ParamListBase } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackScreenProps } from "@react-navigation/stack";

export const APP_SCREEN = {
  UN_AUTHORIZE: 'UN_AUTHORIZE',
  LOGIN: 'LOGIN',
  REGISTER: 'REGISTER',

  AUTHORIZE: 'AUTHORIZE',
  BOTTOM_BAR: 'BOTTOM_BAR',
  DRAWER_BAR: 'DRAWER_BAR',
  HOME: 'HOME',

  SERVERS: {
    STACK: 'ROUTES.SERVERS.STACK',
    HOME: 'ROUTES.SERVERS.HOME',
  },

  NOTIFICATION: {
    STACK: 'ROUTES.NOTIFICATION.STACK',
    HOME: 'ROUTES.NOTIFICATION.HOME',
    DETAIL: 'ROUTES.NOTIFICATION.DETAIL',
  },

  MESSAGES: {
    STACK: 'ROUTES.MESSAGES.STACK',
    HOME: 'ROUTES.MESSAGES.HOME',
    MESSAGE_DETAIL: 'ROUTES.MESSAGES.MESSAGE_DETAIL',
    NEW_MESSAGE: 'ROUTES.MESSAGES.NEW_MESSAGE',
    NEW_GROUP: 'ROUTES.MESSAGES.NEW_GROUP',
  },

  FRIENDS: {
    STACK: 'ROUTES.FRIENDS.STACK',
    HOME: 'ROUTES.FRIENDS.HOME',
    ADD_FRIEND: 'ROUTES.FRIENDS.ADD_FRIEND',
    REQUEST_FRIEND: 'ROUTES.FRIENDS.REQUEST_FRIEND',
    REQUEST_FRIEND_SETTING: 'ROUTES.FRIENDS.REQUEST_FRIEND_SETTING',
  },

  PROFILE: {
    STACK: 'ROUTES.PROFILE.STACK',
    HOME: 'ROUTES.PROFILE.HOME',
  },

  MENU_THREAD: {
    STACK: 'ROUTES.MENU_THREAD.STACK',
    BOTTOM_SHEET: 'ROUTES.MENU_THREAD.BOTTOM_SHEET',
    CREATE_THREAD: 'ROUTES.MENU_THREAD.CREATE_THREAD',
    CREATE_THREAD_FORM_MODAL: 'ROUTES.MENU_THREAD.CREATE_THREAD_FORM_MODAL',
    MUTE_THREAD_DETAIL_CHANNEL: 'ROUTES.MENU_THREAD.MUTE_THREAD_DETAIL_CHANNEL'
  },

  MENU_CLAN: {
    STACK: 'ROUTES.MENU_CLAN.STACk',
    CREATE_CATEGORY: 'ROUTES.MENU_CLAN.CREATE_CATEGORY',
    CREATE_CHANNEL: 'ROUTES.MENU_CLAN.CREATE_CHANNEL',
    CREATE_EVENT: 'ROUTES.MENU_CLAN.CREATE_EVENT',
    CREATE_EVENT_DETAILS: 'ROUTES.MENU_CLAN.CREATE_EVENT_DETAILS',
    CREATE_EVENT_PREVIEW: 'ROUTES.MENU_CLAN.CREATE_EVENT_PREVIEW',
    SETTINGS: 'ROUTES.MENU_CLAN.SETTINGS',
    OVERVIEW_SETTING: 'ROUTES.MENU_CLAN.OVERVIEW_SETTING'
  },

  SETTINGS: {
    STACK: 'ROUTES.SETTINGS.STACK',
    HOME: 'ROUTES.SETTINGS.HOME',
    LANGUAGE: 'ROUTES.SETTINGS.LANGUAGE',
    PROFILE: 'ROUTES.SETTINGS.PROFILE',
    SHARING: 'ROUTES.SETTINGS.SHARING'
  }
} as const;

type ServerStackParamList = {
  [APP_SCREEN.SERVERS.HOME]: undefined;
}

type NotificationStackParamList = {
  [APP_SCREEN.NOTIFICATION.HOME]: undefined;
  [APP_SCREEN.NOTIFICATION.DETAIL]: undefined;
}

type MessagesStackParamList = {
  [APP_SCREEN.MESSAGES.HOME]: undefined;
  [APP_SCREEN.MESSAGES.MESSAGE_DETAIL]: undefined;
  [APP_SCREEN.MESSAGES.NEW_MESSAGE]: undefined;
  [APP_SCREEN.MESSAGES.NEW_GROUP]: undefined;
}

type FriendsStackParamList = {
  [APP_SCREEN.FRIENDS.HOME]: undefined;
  [APP_SCREEN.FRIENDS.ADD_FRIEND]: undefined;
  [APP_SCREEN.FRIENDS.REQUEST_FRIEND]: undefined;
  [APP_SCREEN.FRIENDS.REQUEST_FRIEND_SETTING]: undefined;
}

type ProfileStackParamList = {
  [APP_SCREEN.PROFILE.HOME]: undefined;
}

type MenuThreadStackParamList = {
  [APP_SCREEN.MENU_THREAD.BOTTOM_SHEET]: undefined;
  [APP_SCREEN.MENU_THREAD.CREATE_THREAD]: undefined;
  [APP_SCREEN.MENU_THREAD.CREATE_THREAD_FORM_MODAL]: undefined;
  [APP_SCREEN.MENU_THREAD.MUTE_THREAD_DETAIL_CHANNEL]: undefined;
}

type MenuClanStackParamList = {
  [APP_SCREEN.MENU_CLAN.CREATE_CATEGORY]: undefined;
  [APP_SCREEN.MENU_CLAN.CREATE_CHANNEL]: {
    categoryId: string;
  };
  [APP_SCREEN.MENU_CLAN.CREATE_EVENT]: undefined
  [APP_SCREEN.MENU_CLAN.CREATE_EVENT_DETAILS]: {
    type: OptionEvent;
    channelId: string;
    location: string
  }
  [APP_SCREEN.MENU_CLAN.CREATE_EVENT_PREVIEW]: {
    type: OptionEvent;
    channelId: string;
    location: string;
    startTime: Date;
    endTime: Date;
    title: string;
    description: string;
    frequency: number;
  }
  [APP_SCREEN.MENU_CLAN.SETTINGS]: undefined;
  [APP_SCREEN.MENU_CLAN.OVERVIEW_SETTING]: undefined;
};

type SettingStackParamList = {
  [APP_SCREEN.SETTINGS.HOME]: undefined;
  [APP_SCREEN.SETTINGS.LANGUAGE]: undefined;
  [APP_SCREEN.SETTINGS.PROFILE]: undefined;
}

type AppStackParamList = {
  [APP_SCREEN.UN_AUTHORIZE]: undefined,
  [APP_SCREEN.LOGIN]: undefined,
  [APP_SCREEN.REGISTER]: undefined,
  [APP_SCREEN.AUTHORIZE]: undefined,
  [APP_SCREEN.BOTTOM_BAR]: undefined,
  [APP_SCREEN.DRAWER_BAR]: undefined,
  [APP_SCREEN.HOME]: undefined,
  [APP_SCREEN.SERVERS.STACK]: NavigatorScreenParams<ServerStackParamList>,
  [APP_SCREEN.NOTIFICATION.STACK]: NavigatorScreenParams<NotificationStackParamList>
  [APP_SCREEN.MESSAGES.STACK]: NavigatorScreenParams<MessagesStackParamList>,
  [APP_SCREEN.FRIENDS.STACK]: NavigatorScreenParams<FriendsStackParamList>,
  [APP_SCREEN.PROFILE.STACK]: NavigatorScreenParams<ProfileStackParamList>,
  [APP_SCREEN.MENU_THREAD.STACK]: NavigatorScreenParams<MenuThreadStackParamList>,
  [APP_SCREEN.MENU_CLAN.STACK]: NavigatorScreenParams<MenuClanStackParamList>,
  [APP_SCREEN.SETTINGS.STACK]: NavigatorScreenParams<SettingStackParamList>,
}

type CustomStackScreenProps<
  U extends ParamListBase,
  T extends keyof U = string
> = CompositeScreenProps<
  // NativeStackScreenProps<U, T>,
  NativeStackScreenProps<U>,
  AppStackScreenProps<keyof AppStackParamList>
>;

export type AppStackScreenProps<T extends keyof AppStackParamList = typeof APP_SCREEN.HOME> = StackScreenProps<AppStackParamList, T>;

export type MenuClanScreenProps<T extends keyof MenuClanStackParamList> = CustomStackScreenProps<MenuClanStackParamList, T>