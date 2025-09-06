import { DateTime } from '@/services/time';
import { Box, Label } from 'astal/gtk3/widget';
import Gtk from 'gi://Gtk?version=3.0';

export default function Time(): Box {
  const box = new Box({
    halign: Gtk.Align.FILL,
  });
  box.get_style_context().add_class('time-container');
  const dateLabel = new Label({ angle: 90 });
  const timeLabel = new Label({
    angle: 90,
    valign: Gtk.Align.CENTER,
    halign: Gtk.Align.CENTER,
  });
  timeLabel.get_style_context().add_class('time-label');
  DateTime((value) => {
    // const date = value.format("%D, %d %M %Y");
    const time = value.format('%H:%i');
    // dateLabel.set_label(date);
    timeLabel.set_label(time);

    box.foreach((child) => box.remove(child));
    // box.add(dateLabel);
    box.add(timeLabel);
  });
  return box;
}
