import { App } from 'astal/gtk3';
import style from './style.scss';
import Bar from './windows/Bar';
import OSDWindow from './widgets/osds/OSD';
import { Settings } from './windows/settings/Main';
import { NotificationPopups } from './widgets/notifications/NotificationPopups';
import QuickSettings from './windows/qs/Container';

App.start({
  css: style,
  main() {
    App.get_monitors().map(Bar);
    App.get_monitors().map(NotificationPopups);
    App.get_monitors().map(OSDWindow);
    App.get_monitors().map(Settings);
    App.get_monitors().map(QuickSettings);
  },
});
