import { execAsync, GLib } from 'astal';
import { Gtk, Astal } from 'astal/gtk3';
import { Box, EventBox, Icon, Label, Button } from 'astal/gtk3/widget';
import Notifd from 'gi://AstalNotifd';

const isIcon = (icon: string) => !!Astal.Icon.lookup_icon(icon);

const fileExists = (path: string) => GLib.file_test(path, GLib.FileTest.EXISTS);

const time = (time: number, format = '%H:%M') =>
  GLib.DateTime.new_from_unix_local(time).format(format)!;

const urgency = (n: Notifd.Notification) => {
  const { LOW, NORMAL, CRITICAL } = Notifd.Urgency;
  switch (n.urgency) {
    case LOW:
      return 'low';
    case CRITICAL:
      return 'critical';
    case NORMAL:
    default:
      return 'normal';
  }
};

type NotificationProps = {
  notification: Notifd.Notification;
  onDismiss?: (id: number) => void;
  onInvoke?: (id: number, actionId: string) => void;
  onHover?: () => void;
  onHoverLost?: () => void;
};

export function Notification({
  notification: n,
  onDismiss,
  onInvoke,
  onHover,
  onHoverLost,
}: NotificationProps): EventBox {
  const { START, CENTER, END } = Gtk.Align;

  const eventBox = new EventBox();
  eventBox.className = `Notification ${urgency(n)}`;

  if (onHover) eventBox.connect('enter-notify-event', onHover);
  if (onHoverLost) eventBox.connect('leave-notify-event', onHoverLost);

  const mainBox = new Box({ vertical: true });

  // Header
  const headerBox = new Box();
  headerBox.className = 'header';

  if (n.appIcon || n.desktopEntry) {
    const appIcon = new Icon({
      icon: n.appIcon || n.desktopEntry,
    });
    appIcon.className = 'app-icon';
    headerBox.add(appIcon);
  }

  const appNameLabel = new Label({
    label: n.appName || 'Unknown',
    halign: START,
    truncate: true,
  });
  appNameLabel.className = 'app-name';
  headerBox.add(appNameLabel);

  const timeLabel = new Label({
    label: time(n.time),
    hexpand: true,
    halign: END,
  });
  timeLabel.className = 'time';
  headerBox.add(timeLabel);

  const closeButton = new Button();
  closeButton.add(new Icon({ icon: 'window-close-symbolic' }));
  closeButton.connect('clicked', () => {
    if (onDismiss) {
      onDismiss(n.id);
    } else {
      n.dismiss();
    }
  });
  headerBox.add(closeButton);

  mainBox.add(headerBox);

  // Content
  const contentBox = new Box();
  contentBox.className = 'content';

  // Image handling
  if (n.image && fileExists(n.image)) {
    const imageBox = new Box({
      valign: START,
    });
    imageBox.className = 'image';
    imageBox.css = `background-image: url('${n.image}')`;
    contentBox.add(imageBox);
  } else if (n.image && isIcon(n.image)) {
    const iconImageBox = new Box({
      expand: false,
      valign: START,
    });
    iconImageBox.className = 'icon-image';
    const imageIcon = new Icon({
      icon: n.image,
      expand: true,
      halign: CENTER,
      valign: CENTER,
    });
    iconImageBox.add(imageIcon);
    contentBox.add(iconImageBox);
  }

  const textBox = new Box({ vertical: true });

  const summaryLabel = new Label({
    label: n.summary,
    halign: START,
    xalign: 0,
    truncate: true,
  });
  summaryLabel.className = 'summary';
  textBox.add(summaryLabel);

  if (n.body) {
    const bodyLabel = new Label({
      label: n.body,
      wrap: true,
      useMarkup: true,
      halign: START,
      xalign: 0,
      justifyFill: true,
    });
    bodyLabel.className = 'body';
    textBox.add(bodyLabel);
  }

  contentBox.add(textBox);
  mainBox.add(contentBox);

  // Actions
  const actions = n.get_actions();
  if (actions.length > 0) {
    const actionsBox = new Box();
    actionsBox.className = 'actions';

    actions.forEach(({ label, id }) => {
      const actionButton = new Button({ hexpand: true });
      const actionLabel = new Label({
        label: label,
        halign: CENTER,
        hexpand: true,
      });
      actionButton.add(actionLabel);
      actionButton.connect('clicked', () => {
        if (onInvoke) {
          onInvoke(n.id, id);
        } else {
          n.invoke(id);
        }
      });
      actionsBox.add(actionButton);
    });

    mainBox.add(actionsBox);
  }

  eventBox.add(mainBox);
  return eventBox;
}
