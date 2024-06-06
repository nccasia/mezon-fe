import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import type { Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NX_CHAT_APP_FCM_API_KEY as string,
  authDomain: process.env.NX_CHAT_APP_FCM_AUTH_DOMAIN as string,
  projectId: process.env.NX_CHAT_APP_FCM_PROJECT_ID as string,
  storageBucket: process.env.NX_CHAT_APP_FCM_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NX_CHAT_APP_FCM_MESSAGING_SENDER_ID as string,
  appId: process.env.NX_CHAT_APP_FCM_APP_ID as string,
  measurementId: process.env.NX_CHAT_APP_FCM_MEASUREMENT_ID as string,
};

let messaging: Messaging| null = null;

function isPlatformSupported() {
  return 'serviceWorker' in navigator;
}

function isMessagingAvailable(messaging: Messaging | null): messaging is Messaging {
  return isPlatformSupported() && messaging !== null;
}

function initializeFirebase() {
  if (isPlatformSupported()) {
    initializeApp(firebaseConfig);
    messaging = getMessaging();
  }
}


export const requestForToken = async () => {
  let currentToken = '';
  try {
    if (!isMessagingAvailable(messaging)) {
      throw new Error('Platform is not supported');
    }

    currentToken = await getToken(messaging, { vapidKey: process.env.NX_CHAT_APP_FCM_VAPID_KEY as string});
  } catch (error) {
    return '';
  }
  return currentToken;
};

initializeFirebase();

export const onMessageListener = () => {
  return new Promise((resolve, reject) => {
    try {
      if (!isMessagingAvailable(messaging)) {
        throw new Error('Platform is not supported');
      }

      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    } catch (e) {
      reject(e);
    }
  });
}