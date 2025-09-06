import BrightnessService from '@/services/brightness';
import { GLib, Variable } from 'astal';
import { Box, EventBox, Icon, Label, Slider } from 'astal/gtk3/widget';

const TIMEOUT_DELAY = 5000;
const blocking = Variable<boolean>(false);

type BrightnessOSDItem = {
  widget: Box;
  blocking: boolean;
  abortController: { abort: () => void };
};

class BrightnessOSDMap {
  private current = Variable<BrightnessOSDItem | null>(null);
  private service = BrightnessService.get_default();

  constructor() {
    // Reactively update on screen brightness change
    this.service.connect('notify::screen', () => {
      const existing = this.current.get();
      if (existing) {
        existing.abortController.abort();
        existing.widget.destroy();
      }

      const newWidget = this.constructWidget(this.service.screen);
      const abortController = { abort: () => {} };

      this.current.set({
        widget: newWidget,
        blocking: true,
        abortController: abortController,
      });

      this.waitUntilUnblocked(abortController)
        .then(() => {
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

      // Allow fade timeout
      const updated = this.current.get();
      if (updated) updated.blocking = false;
    });
  }

  private constructWidget(brightness: number): Box {
    const box = new Box();

    const icon = new Icon({
      icon:
        brightness <= 0.05
          ? 'display-brightness-off-symbolic'
          : brightness < 0.5
            ? 'display-brightness-low-symbolic'
            : 'display-brightness-high-symbolic',
      pixel_size: 100,
    });

    const slider = new Slider({
      value: brightness,
      hexpand: true,
      onDragged: (prop) => {
        const val = prop.get_value();
        this.service.screen = val;
      },
    });

    slider.get_style_context().add_class('brightness-slider');
    box.get_style_context().add_class('brightness-osd');

    box.add(icon);
    box.add(slider);

    return box;
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

  subscribe(callback: (item: BrightnessOSDItem | null) => void) {
    return this.current.subscribe(callback);
  }
}

export default function BrightnessOSDWidget(): EventBox {
  const box = new EventBox({
    onHover: () => blocking.set(true),
    onHoverLost: () => blocking.set(false),
  });

  box.get_style_context().add_class('brightness-osd-container');

  const osd = new BrightnessOSDMap();

  osd.subscribe((item) => {
    box.foreach((child) => box.remove(child));
    if (item) {
      box.add(item.widget);
    }
  });

  return box;
}
