
const START_NOTIFICATION_SERVICE = 'PUSH_RECEIVER:::START_NOTIFICATION_SERVICE'
const NOTIFICATION_SERVICE_STARTED = 'PUSH_RECEIVER:::NOTIFICATION_SERVICE_STARTED'
const NOTIFICATION_SERVICE_ERROR = 'PUSH_RECEIVER:::NOTIFICATION_SERVICE_ERROR'
const NOTIFICATION_RECEIVED = 'PUSH_RECEIVER:::NOTIFICATION_RECEIVED'
const TOKEN_UPDATED = 'PUSH_RECEIVER:::TOKEN_UPDATED'

console.log('electron-renderer.js loaded');

window.electron?.on(NOTIFICATION_SERVICE_STARTED, (_, token) => {
  localStorage.setItem('fcmToken', token);
  window.electron.getDeviceId().then(deviceId => {
    const fcmTokenObject = { token, deviceId };
    localStorage.setItem('fcmTokenObject', JSON.stringify(fcmTokenObject));
  })
});

window.electron?.on(NOTIFICATION_SERVICE_ERROR, (_, error) => {
  console.log('notification error', error);
});

// Send FCM token to backend
window.electron?.on(TOKEN_UPDATED, (_, token) => {
  console.log('token updated', token);
});

window.electron?.on(NOTIFICATION_RECEIVED, (_, serverNotificationPayload) => {
  if (serverNotificationPayload.notification.body) {

    new Notification(serverNotificationPayload.notification.title, {
      body: serverNotificationPayload.notification.body
    })
  } else {
    console.log('do something with the key/value pairs in the data', serverNotificationPayload.data);
  }
});

const senderId = '285548761692';
window.electron?.send(START_NOTIFICATION_SERVICE, senderId);
