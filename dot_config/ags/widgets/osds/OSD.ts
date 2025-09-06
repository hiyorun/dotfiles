import { App, Astal, Gdk } from 'astal/gtk3';
import { Box, Window } from 'astal/gtk3/widget';
import VolumeOSDWidget from './Volume';
import BrightnessOSDWidget from './Brightness';

export default function OSDWindow(mon: Gdk.Monitor) {
  const { BOTTOM } = Astal.WindowAnchor;
  const win = new Window();
  win.set_application(App);
  win.set_exclusivity(Astal.Exclusivity.NORMAL);
  win.set_layer(Astal.Layer.OVERLAY);
  win.set_anchor(BOTTOM);
  win.set_gdkmonitor(mon);

  const box = new Box({
    vertical: true,
  });
  box.add(VolumeOSDWidget());
  box.add(BrightnessOSDWidget());
  box.get_style_context().add_class('osd');
  box.set_spacing(6);

  win.add(box);
  win.get_style_context().add_class('osd-window');
}
