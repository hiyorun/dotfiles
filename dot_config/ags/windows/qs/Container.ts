import { Battery } from '@/widgets/battery/Battery';
import { App, Astal, Gdk, Gtk, Widget } from 'astal/gtk3';
import { OverviewBox } from './Overview';

export default function QuickSettings(gdkmonitor: Gdk.Monitor): Gtk.Window {
  const { TOP, LEFT } = Astal.WindowAnchor;

  const main = new Widget.Window({
    name: 'quick_settings',
    application: App,
    exclusivity: Astal.Exclusivity.NORMAL,
    anchor: LEFT | TOP,
    gdkmonitor: gdkmonitor,
  });
  main.get_style_context().add_class('bar');

  main.connect('delete-event', (widget) => {
    widget.hide();
    return true;
  });

  const centerbox = new Widget.CenterBox({
    orientation: Gtk.Orientation.VERTICAL,
    center_widget: OverviewBox(),
  });

  centerbox.get_style_context().add_class('centerbox');

  main.add(centerbox);
  main.hide();
  return main;
}
