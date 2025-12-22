import { DateTime } from '@/services/time';
import { Box, Label } from 'astal/gtk3/widget';
import Gtk from 'gi://Gtk?version=3.0';

export default function Time(): Label {
  const dateLabel = new Label({ angle: 90 });
  const timeLabel = new Label({
    angle: 90,
    valign: Gtk.Align.CENTER,
    halign: Gtk.Align.CENTER,
  });
  timeLabel.get_style_context().add_class('time-label');
  DateTime((value) => {
    const time = value.format('%H:%i');
    timeLabel.set_label(time);
  });
  return timeLabel
}
