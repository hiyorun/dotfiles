import { exec, execAsync, Variable } from 'astal';
import { bind, Subscribable } from 'astal/binding';
import AstalBattery from 'gi://AstalBattery';

type BatteryStruct = {
  charging: boolean;
  percentage: number;
  visible: boolean;
};

export class BatteryService implements Subscribable {
  private object = Variable<BatteryStruct>({
    charging: false,
    percentage: 0,
    visible: false,
  });

  constructor() {
    const battery = AstalBattery.get_default();
    const percentage = battery.get_percentage();
    const visible = battery.get_is_present();
    const charging = battery.get_charging();
    this.object.set({
      charging: charging,
      percentage: percentage,
      visible: visible,
    });

    bind(battery, 'isPresent').subscribe((val) => {
      const current = this.object.get();
      this.object.set({
        charging: current.charging,
        percentage: current.percentage,
        visible: val,
      });
    });

    bind(battery, 'percentage').subscribe((val) => {
      if (val == 0.1) {
        execAsync([
          'notify-send',
          '-u',
          'critical',
          '-i',
          'battery-caution',
          `Battery is ${Math.round(val * 100)}%`,
          'Plug in your charger!',
        ]).catch((err) => {
          console.log('failed to notify', err);
        });
      }
      const current = this.object.get();
      this.object.set({
        charging: current.charging,
        percentage: val,
        visible: current.visible,
      });
    });

    bind(battery, 'charging').subscribe((val) => {
      const current = this.object.get();
      this.object.set({
        charging: val,
        percentage: current.percentage,
        visible: current.visible,
      });
    });
  }

  get(): BatteryStruct {
    return this.object.get();
  }

  subscribe(callback: (value: BatteryStruct) => void): () => void {
    return this.object.subscribe(callback);
  }
}

export function BatteryLevel() {}
