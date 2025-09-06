import GObject, { register, property } from 'astal/gobject';
import { monitorFile, readFileAsync } from 'astal/file';
import { exec, execAsync } from 'astal/process';

const get = (args: string): number => {
  let out: string;
  try {
    out = exec(`brightnessctl ${args}`);
    console.log(out);
  } catch (err) {
    console.log("brightnessctl doesn't exists. Brightness control is disabled");
    return 0;
  }
  return Number(out);
};

// Get device names
const screenDevice = exec(`bash -c "ls -w1 /sys/class/backlight | head -1"`).trim();
const kbdDevice = exec(`bash -c "ls -w1 /sys/class/leds | head -1"`).trim();

// Brightness Service
@register({ GTypeName: 'BrightnessService' })
export default class BrightnessService extends GObject.Object {
  static instance: BrightnessService;
  static get_default(): BrightnessService {
    if (!this.instance) this.instance = new BrightnessService();
    return this.instance;
  }

  #screenMax = get(`--device ${screenDevice} max`);
  #kbdMax = get(`--device ${kbdDevice} max`);

  #screenBrightness = get(`--device ${screenDevice} get`) / (this.#screenMax || 1);
  #kbdBrightness = get(`--device ${kbdDevice} get`);

  @property(Number)
  get screen(): number {
    return this.#screenBrightness;
  }

  set screen(percent: number) {
    percent = Math.max(0, Math.min(1, percent));
    const value = Math.floor(percent * 100);

    execAsync(`brightnessctl -d ${screenDevice} set ${value}% -q`)
      .then(() => {
        this.#screenBrightness = percent;
        this.notify('screen');
      })
      .catch(() => {
        console.log("brightnessctl doesn't exists. Brightness control is disabled");
      });
  }

  @property(Number)
  get kbd(): number {
    return this.#kbdBrightness;
  }

  set kbd(value: number) {
    if (value < 0 || value > this.#kbdMax) return;

    execAsync(`brightnessctl -d ${kbdDevice} set ${value} -q`).then(() => {
      this.#kbdBrightness = value;
      this.notify('kbd');
    });
  }

  constructor() {
    super();

    const screenPath = `/sys/class/backlight/${screenDevice}/brightness`;
    const kbdPath = `/sys/class/leds/${kbdDevice}/brightness`;

    // Watch screen brightness file
    monitorFile(screenPath, async (file) => {
      const value = Number(await readFileAsync(file));
      this.#screenBrightness = value / this.#screenMax;
      this.notify('screen');
    });

    // Watch keyboard brightness file
    monitorFile(kbdPath, async (file) => {
      const value = Number(await readFileAsync(file));
      this.#kbdBrightness = value;
      this.notify('kbd');
    });
  }
}
