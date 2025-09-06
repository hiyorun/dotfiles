import { Box, Label } from 'astal/gtk3/widget';
import mprisService, { MediaInfo } from '@/services/mpris';
import { Ellipsis } from '@/utils/ellipsis';

export default function Media(): Box {
  const box = new Box();
  box.get_style_context().add_class('media-container');

  const label = new Label({ angle: 90 });
  label.get_style_context().add_class('media-label');
  box.add(label);

  // Set initial value
  label.set_label(formatMetadata(mprisService.get()));

  mprisService.subscribe((newValue) => label.set_label(formatMetadata(newValue)));

  return box;
}

function formatMetadata(player: MediaInfo): string {
  const title = Ellipsis(player.title, 20);
  const artist = Ellipsis(player.artist, 20);
  return `${artist} ${artist === '' ? '' : '-'} ${title}`;
}
