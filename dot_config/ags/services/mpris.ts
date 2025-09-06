import { Variable } from 'astal';
import { Subscribable } from 'astal/binding';
import Mpris from 'gi://AstalMpris';

const PlaybackStatus = Mpris.PlaybackStatus;

export type MediaInfo = {
  artist: string;
  album: string;
  title: string;
  albumArt: string;
  playerName: string;
  control: MediaControl;
};

export type MediaControl = {
  status: Mpris.PlaybackStatus;
  position: number;
  prev: boolean;
  next: boolean;
  play: boolean;
  pause: boolean;
};

class MprisService implements Subscribable {
  private players: Map<string, Mpris.Player> = new Map();
  private mediaUpdates: Variable<MediaInfo> = new Variable({
    artist: '',
    album: '',
    title: '',
    albumArt: '',
    playerName: '',
    control: {
      status: PlaybackStatus.STOPPED,
      position: 0,
      prev: false,
      next: false,
      play: false,
      pause: false,
    },
  });

  constructor() {
    const mpris = Mpris.Mpris.get_default();

    // Handle new players being added
    mpris.connect('player-added', (_mpris, player) => {
      this.addPlayer(player);
    });

    // Handle players being removed
    mpris.connect('player-closed', (_mpris, player) => {
      this.removePlayer(player.identity);
    });

    // Initialize with existing players
    mpris.players.forEach((player) => {
      this.addPlayer(player);
    });
  }

  private addPlayer(player: Mpris.Player) {
    // Store the player
    this.players.set(player.identity, player);

    // Connect to metadata changes
    player.connect('notify::metadata', () => {
      this.updateMediaInfo(player);
    });

    // Set initial media info
    this.updateMediaInfo(player);
  }

  private removePlayer(playerId: string) {
    this.players.delete(playerId);

    // If there are other players, update with the first one
    if (this.players.size > 0) {
      const nextPlayer = [...this.players.values()][0];
      this.updateMediaInfo(nextPlayer);
    } else {
      // No more players, set empty
      this.clearMediaInfo();
    }
  }

  private updateMediaInfo(player: Mpris.Player) {
    this.mediaUpdates.set({
      artist: player.get_artist(),
      album: player.get_album(),
      title: player.get_title(),
      albumArt: player.get_cover_art(),
      playerName: player.get_identity(),
      control: {
        status: player.get_playback_status(),
        position: player.get_position(),
        prev: player.get_can_go_previous(),
        next: player.get_can_go_next(),
        play: player.get_can_play(),
        pause: player.get_can_pause(),
      },
    });
  }

  private clearMediaInfo() {
    this.mediaUpdates.set({
      artist: '',
      album: '',
      title: '',
      albumArt: '',
      playerName: '',
      control: {
        status: PlaybackStatus.STOPPED,
        position: 0,
        prev: false,
        next: false,
        play: false,
        pause: false,
      },
    });
  }

  get() {
    return this.mediaUpdates.get();
  }

  subscribe(callback: (mediaInfo: MediaInfo) => void) {
    return this.mediaUpdates.subscribe(callback);
  }
}

const mprisService = new MprisService();
export default mprisService;
