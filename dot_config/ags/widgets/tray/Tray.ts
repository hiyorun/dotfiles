import { Gtk, Widget } from 'astal/gtk3';
import { Box } from 'astal/gtk3/widget';
import TrayService from '@/services/tray';
import { Battery } from '../battery/Battery';
import Time from '../time/Time';

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

  const timeBox = new Box({
    valign: Gtk.Align.CENTER,
    halign: Gtk.Align.CENTER,
  });
  timeBox.add(Time());
  timeBox.className = 'time-tray';

  box.add(appTray);
  box.add(battery);
  box.add(timeBox);

  return box;
}
