/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */

self.addEventListener('notificationclick', function (event) {
	event.notification.close();
	event.waitUntil(
		clients
			.matchAll({
				type: 'window',
				includeUncontrolled: true
			})
			.then(function (clientList) {
				for (let i = 0; i < clientList.length; i++) {
					const client = clientList[i];
					if (client.url === event.notification.data.FCM_MSG.data.link && 'focus' in client) {
						return client.focus();
					}
				}
				if (clients.openWindow) {
					return clients.openWindow(event.notification.data.FCM_MSG.data.link);
				}
			})
	);
});

importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

const firebaseConfig = {
	apiKey: 'AIzaSyAzgF6LfHVWzlr9gGHWU7emix2768wSGHg',
	authDomain: 'mezon-772fa.firebaseapp.com',
	projectId: 'mezon-772fa',
	storageBucket: 'mezon-772fa.appspot.com',
	messagingSenderId: '285548761692',
	appId: '1:285548761692:web:3ca531af1deecee74e0c99',
	measurementId: 'G-0WNQTXVMT3'
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
