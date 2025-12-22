import BarMedia from '@/widgets/media/Media';
import Time from '@/widgets/time/Time';
import { Box } from 'astal/gtk3/widget';
import Gtk from 'gi://Gtk?version=3.0';

export default function UpperSection(): Box {
  const box = new Box();
  box.get_style_context().add_class('section-upper');
  box.set_orientation(Gtk.Orientation.VERTICAL);
  box.set_spacing(5);
  box.pack_start(BarMedia(), false, false, 0);
  return box;
}
