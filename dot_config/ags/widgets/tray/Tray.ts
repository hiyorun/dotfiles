import { Gtk, Widget } from 'astal/gtk3';
import { Box } from 'astal/gtk3/widget';
import TrayService from '@/services/tray';
import { Battery } from '../battery/Battery';

export default function Tray(): Box {
  const trays = new TrayService();
  const appTray = new Box({
    orientation: Gtk.Orientation.VERTICAL,
    className: 'app-tray-container',
  });

  trays.subscribe((widgets) => {
    appTray.foreach((child) => appTray.remove(child));

    widgets.forEach((widget) => {
      widget.get_style_context().add_class('tray-item');
      appTray.add(widget);
    });
    appTray.show_all();
  });

  const box = new Box({
    orientation: Gtk.Orientation.VERTICAL,
    className: 'tray-container',
  });

  const battery = Battery('icon');
  battery.get_style_context().add_class('tray-item');
  battery.get_style_context().add_class('battery-icon');
  box.add(appTray);
  box.add(battery);

  return box;
}
