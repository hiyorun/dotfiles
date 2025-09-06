import { Astal, Gdk } from 'astal/gtk3';
import { Box, Window } from 'astal/gtk3/widget';
import { NotificationService } from '@/services/notification';
import { Notification } from './Notification';
import { bind, execAsync } from 'astal';

const TIMEOUT_DELAY = 5000;

// Track timeout state for each notification
const timeoutState = new Map<number, { blocking: boolean; timeout: number }>();

export function NotificationPopups(gdkmonitor: Gdk.Monitor): Window {
  const { TOP } = Astal.WindowAnchor;
  const service = new NotificationService();

  const window = new Window({
    className: 'NotificationPopups',
    gdkmonitor: gdkmonitor,
    exclusivity: Astal.Exclusivity.IGNORE,
    anchor: TOP,
  });

  const mainBox = new Box({
    vertical: true,
  });

  // Helper function to start timeout for a notification
  const startTimeout = (notificationId: number) => {
    const state = timeoutState.get(notificationId) || { blocking: false, timeout: TIMEOUT_DELAY };
    timeoutState.set(notificationId, state);

    const tick = () => {
      const currentState = timeoutState.get(notificationId);
      if (!currentState) return; // Notification was removed

      if (!currentState.blocking) {
        currentState.timeout -= 100;
        if (currentState.timeout <= 0) {
          service.dismissNotification(notificationId);
          timeoutState.delete(notificationId);
          return;
        }
      }
      setTimeout(tick, 100);
    };

    setTimeout(tick, 100);
  };

  // Update widgets when notifications change
  service.subscribe((val) => {
    // Clear existing children
    mainBox.children.forEach((child) => child.destroy());

    // Add notifications (reversed to show newest first)
    const notifications = [...val.notifications].reverse();
    notifications.forEach((notification, index) => {
      const widget = Notification({
        notification,
        onDismiss: (id) => service.dismissNotification(id),
        onInvoke: (id, actionId) => service.invokeAction(id, actionId),
        onHover: () => {
          const state = timeoutState.get(notification.id);
          if (state) {
            state.blocking = true;
          }
        },
        onHoverLost: () => {
          const state = timeoutState.get(notification.id);
          if (state) {
            state.blocking = false;
          }
        },
      });

      // Add margin classes for first and last children
      if (index === 0) {
        widget.className += ' first-child';
      }
      if (index === notifications.length - 1) {
        widget.className += ' last-child';
      }

      mainBox.add(widget);

      // Start timeout for new notifications
      if (!timeoutState.has(notification.id)) {
        startTimeout(notification.id);
      }
    });
  });

  window.add(mainBox);
  return window;
}
