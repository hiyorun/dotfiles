import Mpris from 'gi://AstalMpris';
import { Variable } from 'astal';
import { Ellipsis } from '@/utils/ellipsis';

const mediaUpdates = new Variable('');

function formatMetadata(player: Mpris.Player) {
  const title = Ellipsis(player.title, 15);
  const artist = Ellipsis(player.artist, 15);
  return `${artist} ${artist === '' ? '' : '-'} ${title}`;
}

const mpris = Mpris.Mpris.get_default();

function initializeMpris() {
  mpris.players.forEach((player) => {
    player.connect('notify::metadata', () => {
      mediaUpdates.set(formatMetadata(player));
    });
    mediaUpdates.set(formatMetadata(player));
  });
}

initializeMpris();

export const onMediaUpdate = mediaUpdates.subscribe.bind(mediaUpdates);
