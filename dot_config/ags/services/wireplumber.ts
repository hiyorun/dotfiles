import { Variable } from 'astal';
import { Subscribable } from 'astal/binding';
import AstalWp from 'gi://AstalWp';

export type VolumeObject = {
  last_prop_change: string;
  id: number;
  volume: number;
  icon: string;
  mute: boolean;
  description: string;
};

export class VolumeService implements Subscribable {
  private var: Variable<VolumeObject> = Variable({
    last_prop_change: '',
    id: -1,
    volume: 0,
    icon: '',
    mute: true,
    description: '',
  });
  private wp: AstalWp.Wp | null;

  constructor() {
    this.wp = AstalWp.get_default();
    const default_out = this.wp?.get_default_speaker();
    default_out?.connect('notify', (object, property) => {
      console.log(`Property changed: ${property?.name || 'unknown'}`);
      console.log(`Volume: ${default_out.get_volume()}`);
      console.log(`Description: ${default_out.get_description()}`);
      console.log(`Icon: ${default_out.get_icon()}`);
      console.log('---');

      this.setInternal(
        property.get_name(),
        default_out.get_id(),
        default_out.get_volume(),
        default_out.get_icon(),
        default_out.get_mute(),
        default_out.get_description(),
      );
    });
  }

  private setInternal(
    last_prop_change: string,
    id: number,
    volume: number,
    icon: string,
    mute: boolean,
    description: string,
  ) {
    const setVal: VolumeObject = {
      last_prop_change,
      id,
      volume,
      icon,
      mute,
      description,
    };

    this.var.set(setVal);
  }

  plumber(): AstalWp.Wp | null {
    return this.wp;
  }

  get() {
    return this.var.get();
  }

  subscribe(callback: (osd: VolumeObject) => void) {
    return this.var.subscribe(callback);
  }
}

export default function Wireplumber() { }
