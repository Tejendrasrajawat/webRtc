// Scripts for firebase and firebase messaging
// eslint-disable-next-line no-undef
// import img from "./logo192.png";

// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: "AIzaSyCPZbL2KlLmHvFYJEm2BMsmxI9tNpnQ6ps",
  authDomain: "test-18156.firebaseapp.com",
  projectId: "test-18156",
  storageBucket: "test-18156.appspot.com",
  messagingSenderId: "779243800880",
  appId: "1:779243800880:web:fcea2f07956e30987ae0f5",
  measurementId: "G-NNR1Z6N7DR",
};

// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
// eslint-disable-next-line no-undef
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    title: payload.notification.title,
    body: payload.notification.body,
    icon: "",
  };

  // eslint-disable-next-line no-restricted-globals
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
