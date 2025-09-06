import { App, Astal, Gtk, Gdk, Widget } from 'astal/gtk3';
import Media from '../widgets/media/Media';
import Time from '../widgets/time/Time';
import Tray from '../widgets/tray/Tray';
import LowerSection from './bar_sections/Lower';
import MiddleSection from './bar_sections/Middle';
import UpperSection from './bar_sections/Upper';

export default function Bar(gdkmonitor: Gdk.Monitor): Gtk.Window {
  const { TOP, LEFT, BOTTOM } = Astal.WindowAnchor;

  const win = new Widget.Window();
  win.set_application(App);
  win.set_exclusivity(Astal.Exclusivity.EXCLUSIVE);
  win.set_anchor(LEFT | TOP | BOTTOM);
  win.set_gdkmonitor(gdkmonitor);
  win.get_style_context().add_class('bar');

  const centerbox = new Widget.CenterBox();
  centerbox.set_orientation(Gtk.Orientation.VERTICAL);
  centerbox.set_start_widget(UpperSection());
  centerbox.set_center_widget(MiddleSection());
  centerbox.set_end_widget(LowerSection());
  centerbox.get_style_context().add_class('centerbox');

  win.add(centerbox);
  return win;
}
