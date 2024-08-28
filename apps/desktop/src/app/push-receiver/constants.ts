// Event to be sent from renderer process to trigger service start
export const START_NOTIFICATION_SERVICE = 'PUSH_RECEIVER:::START_NOTIFICATION_SERVICE';
// Event sent to the renderer process once the service is up
export const NOTIFICATION_SERVICE_STARTED = 'PUSH_RECEIVER:::NOTIFICATION_SERVICE_STARTED';
// Event sent to the renderer process if an error has occured during the starting process
export const NOTIFICATION_SERVICE_ERROR = 'PUSH_RECEIVER:::NOTIFICATION_SERVICE_ERROR';
// Event sent to the renderer process when a notification has been received
export const NOTIFICATION_RECEIVED = 'PUSH_RECEIVER:::NOTIFICATION_RECEIVED';
// Event sent to the renderer process when the FCM token has been updated
export const TOKEN_UPDATED = 'PUSH_RECEIVER:::TOKEN_UPDATED';
