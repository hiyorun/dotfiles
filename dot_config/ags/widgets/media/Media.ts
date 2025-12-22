import { Box, Label } from 'astal/gtk3/widget';
import mprisService, { MediaInfo } from '@/services/mpris';
import { Ellipsis } from '@/utils/ellipsis';
import { Gtk } from 'astal/gtk3';

export default function BarMedia(): Box {
  const box = new Box();
  box.get_style_context().add_class('bar-media');

  // Set initial value
  formatMetadata(mprisService.get()).forEach((val: Label) => {
    val.set_valign(Gtk.Align.START);
    box.add(val);
  });

  mprisService.subscribe((newValue) => {
    box.foreach((child) => box.remove(child));
    formatMetadata(newValue).forEach((val: Label) => {
      val.set_valign(Gtk.Align.START);
      box.add(val);
    });
  });
  return box;
}

function formatMetadata(player: MediaInfo): Label[] {
  const title = new Label({ angle: 90 });
  title.className = `media-label title`;
  title.set_label(Ellipsis(player.title, 50));

  const artist = new Label({ angle: 90 });
  artist.className = `media-label artist`;
  artist.set_label(Ellipsis(player.artist, 50));

  return [title, artist];
}
