import { Battery } from '@/widgets/battery/Battery';
import Time from '@/widgets/time/Time';
import Tray from '@/widgets/tray/Tray';
import { Gtk } from 'astal/gtk3';
import { Box } from 'astal/gtk3/widget';

export default function LowerSection(): Box {
  const box = new Box();
  box.get_style_context().add_class('section-lower');
  box.set_orientation(Gtk.Orientation.VERTICAL);
  box.set_spacing(5);

  box.pack_end(Tray(), false, false, 0);

  return box;
}
