import { execAsync, Variable } from 'astal';
import { Subscribable } from 'astal/binding';
import Notifd from 'gi://AstalNotifd';

type NotificationStruct = {
  notifications: Notifd.Notification[];
  visible: boolean;
};

export class NotificationService implements Subscribable {
  private object = Variable<NotificationStruct>({
    notifications: [],
    visible: false,
  });

  constructor() {
    const notifd = Notifd.get_default();

    // Optional: Use this to ignore timeout
    // notifd.ignoreTimeout = true

    // Initialize with current notifications if any
    this.object.set({
      notifications: [],
      visible: false,
    });

    notifd.connect('notified', (_, id) => {
      const notification = notifd.get_notification(id);
      if (!notification) return;

      execAsync([
        '/home/hiyo/Documents/Projects/Bash/notif-player/main.sh',
        '/usr/share/sounds/freedesktop/stereo/message.oga',
      ])
        .then((out) => console.log(out))
        .catch((err) => console.error(err));

      const current = this.object.get();
      const newNotifications = [...current.notifications, notification];

      this.object.set({
        notifications: newNotifications,
        visible: newNotifications.length > 0,
      });
    });

    notifd.connect('resolved', (_, id) => {
      const current = this.object.get();
      const newNotifications = current.notifications.filter((n) => n.id !== id);

      this.object.set({
        notifications: newNotifications,
        visible: newNotifications.length > 0,
      });
    });
  }

  get(): NotificationStruct {
    return this.object.get();
  }

  subscribe(callback: (value: NotificationStruct) => void): () => void {
    return this.object.subscribe(callback);
  }

  dismissNotification(id: number): void {
    const current = this.object.get();
    const notification = current.notifications.find((n) => n.id === id);
    if (notification) {
      notification.dismiss();
    }
  }

  invokeAction(id: number, actionId: string): void {
    const current = this.object.get();
    const notification = current.notifications.find((n) => n.id === id);
    if (notification) {
      notification.invoke(actionId);
    }
  }
}
