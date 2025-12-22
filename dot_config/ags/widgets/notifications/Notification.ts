import { GLib } from 'astal';
import { Gtk, Astal } from 'astal/gtk3';
import { Box, EventBox, Icon, Label, Button } from 'astal/gtk3/widget';
import Notifd from 'gi://AstalNotifd';
import { Ellipsis } from '@/utils/ellipsis';

export type NotificationProps = {
  notification: Notifd.Notification;
  onDismiss: (id: number) => void;
  onInvoke: (id: number, actionId: string) => void;
  onHover: () => void;
  onHoverLost: () => void;
};

const formatTime = (unix: number, format = '%H:%M') =>
  GLib.DateTime.new_from_unix_local(unix).format(format)!;

const urgencyClass = (n: Notifd.Notification) => {
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

function NotifImage(n: Notifd.Notification): Box | null {
  if (!n.image) return null;

  if (GLib.file_test(n.image, GLib.FileTest.EXISTS)) {
    const box = new Box({ valign: Gtk.Align.START });
    box.className = 'image';
    box.css = `background-image: url('${n.image}')`;
    return box;
  }

  if (Astal.Icon.lookup_icon(n.image)) {
    const box = new Box({ valign: Gtk.Align.START });
    box.className = 'icon-image';
    box.add(
      new Icon({
        icon: n.image,
        halign: Gtk.Align.CENTER,
        valign: Gtk.Align.CENTER,
      }),
    );
    return box;
  }

  return null;
}

function NotifHeader(n: Notifd.Notification, onDismiss?: (id: number) => void): Box {
  const row = new Box();
  row.className = 'header-text';

  if (n.appIcon || n.desktopEntry) {
    const appIcon = new Icon({
      icon: n.appIcon || n.desktopEntry,
    });
    appIcon.className = 'app-icon';
    row.add(appIcon);
    row.add(
      new Label({
        label: '·',
        halign: Gtk.Align.START,
        className: 'interpunct',
      }),
    );
  }

  row.add(
    new Label({
      label: n.appName || 'Unknown',
      truncate: true,
      halign: Gtk.Align.START,
      className: 'app-name',
    }),
  );

  row.add(
    new Label({
      label: '·',
      halign: Gtk.Align.START,
      className: 'interpunct',
    }),
  );

  row.add(
    new Label({
      label: formatTime(n.time),
      hexpand: true,
      halign: Gtk.Align.START,
      className: 'time',
    }),
  );

  const closeButton = new Button({
    halign: Gtk.Align.END,
  });
  closeButton.add(new Icon({ icon: 'window-close-symbolic' }));
  closeButton.connect('clicked', () => {
    if (onDismiss) {
      onDismiss(n.id);
    } else {
      n.dismiss();
    }
  });

  row.add(closeButton);
  return row;
}

function NotifText(n: Notifd.Notification): Box {
  const text = new Box({ vertical: true });
  text.className = 'text';

  text.add(
    new Label({
      label: n.summary,
      truncate: true,
      xalign: 0,
      halign: Gtk.Align.START,
      className: 'summary',
    }),
  );

  if (n.body) {
    text.add(
      new Label({
        label: Ellipsis(n.body, 120),
        wrap: true,
        useMarkup: true,
        xalign: 0,
        halign: Gtk.Align.START,
        className: 'body',
      }),
    );
  }

  return text;
}

function NotifActions(
  n: Notifd.Notification,
  onInvoke?: (id: number, action: string) => void,
): Box | null {
  const actions = n.get_actions();
  if (!actions.length) return null;

  const box = new Box({ spacing: 5 });
  box.className = 'actions';

  actions.forEach(({ id, label }) => {
    const btn = new Button();
    btn.add(new Label({ label, halign: Gtk.Align.CENTER }));
    btn.connect('clicked', () => (onInvoke ? onInvoke(n.id, id) : n.invoke(id)));
    box.add(btn);
  });

  return box;
}

function MaterialNotificationLayout(
  n: Notifd.Notification,
  onInvoke?: (id: number, action: string) => void,
  onDismiss?: (id: number) => void,
): Box {
  const root = new Box();
  root.className = 'material-layout';

  // LEFT: image column
  const image = NotifImage(n);
  if (image) {
    image.className += ' material-image';
    root.add(image);
  }

  // RIGHT: content column
  const right = new Box({ vertical: true });
  right.className = 'material-content';

  right.add(NotifHeader(n, onDismiss));
  right.add(NotifText(n));

  const actions = NotifActions(n, onInvoke);
  if (actions) right.add(actions);

  root.add(right);
  return root;
}

export function Notification({
  notification: n,
  onDismiss,
  onInvoke,
  onHover,
  onHoverLost,
}: NotificationProps): EventBox {
  const root = new EventBox();
  root.className = `Notification ${urgencyClass(n)}`;

  if (onHover) root.connect('enter-notify-event', onHover);
  if (onHoverLost) root.connect('leave-notify-event', onHoverLost);

  const layout = new Box({ vertical: true });

  // Close button can be overlayed or injected per layout later
  layout.add(MaterialNotificationLayout(n, onInvoke, onDismiss));

  root.add(layout);
  return root;
}
