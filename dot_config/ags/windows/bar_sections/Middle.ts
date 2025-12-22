import BarMedia from '@/widgets/media/Media';
import { Gtk } from 'astal/gtk3';
import { Box } from 'astal/gtk3/widget';

export default function MiddleSection(): Box {
  const box = new Box();
  box.get_style_context().add_class('section-middle');
  box.set_orientation(Gtk.Orientation.HORIZONTAL);
  box.set_halign(Gtk.Align.CENTER);

  return box;
}
