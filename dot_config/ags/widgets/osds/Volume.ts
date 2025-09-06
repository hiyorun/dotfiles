import { VolumeObject, VolumeService } from '@/services/wireplumber';
import { GLib, Variable } from 'astal';
import { Box, EventBox, Icon, Label, Slider } from 'astal/gtk3/widget';

const TIMEOUT_DELAY = 5000;
const blocking = Variable<boolean>(false);

type VolumeOSDItem = {
  widget: Box;
  blocking: boolean;
  abortController: { abort: () => void };
};

class VolumeOSDMap {
  private current = Variable<VolumeOSDItem | null>(null);
  private service: VolumeService;

  constructor() {
    this.service = new VolumeService();

    this.service.subscribe((values) => {
      if (values.last_prop_change === 'state') return;
      const existing = this.current.get();
      if (existing) {
        existing.abortController.abort();
        existing.widget.destroy();
      }

      const newWidget = this.constructWidget(values);
      const abortController = { abort: () => { } };

      this.current.set({
        widget: newWidget,
        blocking: false,
        abortController: abortController,
      });

      this.waitUntilUnblocked(abortController)
        .then(() => {
          console.log('unblocked');
          const latest = this.current.get();
          if (latest?.widget === newWidget) {
            latest.widget.destroy();
            this.current.set(null);
          }
        })
        .catch(() => {
          const latest = this.current.get();
          if (latest === null) return;
          latest.widget.set_opacity(1);
        });
    });
  }

  private constructWidget(values: VolumeObject): Box {
    const group = new Box({
      vertical: true,
    });
    const box = new Box();
    const sinkName = new Label({ label: values.description });

    const volume = new Slider({
      value: values.volume,
      hexpand: true,
      onDragged: (prop) => {
        const val = prop.get_value();
        const plumber = this.service.plumber();
        if (plumber === null) return;
        plumber.get_default_speaker()?.set_volume(val);
      },
    });

    const icon = new Icon({
      icon:
        values.mute || values.volume <= 0.01
          ? 'audio-volume-muted-symbolic'
          : values.volume < 0.33
            ? 'audio-volume-low-symbolic'
            : values.volume < 0.66
              ? 'audio-volume-medium-symbolic'
              : 'audio-volume-high-symbolic',
    });

    volume.get_style_context().add_class('volume-slider');
    if (values.mute) {
      volume.get_style_context().add_class('mute');
    }

    box.add(icon);
    box.add(volume);

    group.add(sinkName);
    group.add(box);
    group.set_spacing(6);
    group.get_style_context().add_class('volume-osd');

    return group;
  }

  private async waitUntilUnblocked(controller: { abort: () => void }): Promise<void> {
    return new Promise((resolve, reject) => {
      let remaining = TIMEOUT_DELAY;
      let lastTick = Date.now();

      let fadeInterval: GLib.Source;
      const interval = setInterval(() => {
        const now = Date.now();
        const current = this.current.get();

        if (current && !current.blocking && !blocking.get()) {
          const elapsed = now - lastTick;
          remaining -= elapsed;
        }

        lastTick = now;

        if (remaining <= 0) {
          clearInterval(interval);

          let opacity = 1.0;
          if (current !== null) {
            fadeInterval = setInterval(() => {
              opacity -= 0.05;
              current.widget.set_opacity(opacity);

              if (opacity <= 0.1) {
                clearInterval(fadeInterval);
                resolve();
              }
            }, 16);
          }
        }
      }, 100);

      controller.abort = () => {
        clearInterval(interval);
        clearInterval(fadeInterval);
        console.log('rejected');
        reject();
      };
    });
  }

  subscribe(callback: (item: VolumeOSDItem | null) => void) {
    return this.current.subscribe(callback);
  }
}

export default function VolumeOSDWidget(): EventBox {
  const box = new EventBox({
    onHover: () => blocking.set(true),
    onHoverLost: () => blocking.set(false),
  });

  box.get_style_context().add_class('volume-osd-container');

  const osd = new VolumeOSDMap();

  osd.subscribe((item) => {
    box.foreach((child) => box.remove(child));
    if (item) {
      box.add(item.widget);
    }
  });

  return box;
}
