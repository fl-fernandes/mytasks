import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [250, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

function Notification(title, body, type = 'calendar', date, weekday, hour, minute, callback) {
  registerForPushNotificationsAsync();

  let trigger = {
    weekday,
    hour,
    minute,
    repeats: true,
  };

  if (type === 'now') {
    trigger = {
      seconds: 2,
    };
  }

  if (type === 'date') {
    trigger = date;
  }

  Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    
    trigger,
  }).then(e => {
    if (callback) {
      callback(e);
    }
  });
}

export default Notification;
