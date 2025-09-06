import { BatteryService } from '@/services/battery';
import { Box, Icon, Label } from 'astal/gtk3/widget';

export type BatteryMode = 'icon' | 'label' | 'both';

export function Battery(mode: BatteryMode = 'both'): Box | Icon | Label {
  const service = new BatteryService();

  const icon = new Icon({ icon: 'battery-missing-symbolic' });
  const label = new Label();
  const box = new Box();
  box.set_spacing(6);

  // Build the widget based on mode
  if (mode === 'both') {
    box.add(icon);
    box.add(label);
  } else if (mode === 'icon') {
    // box unused
  } else if (mode === 'label') {
    // box unused
  }

  // Initial fetch and set
  const initVal = service.get();
  if (initVal.visible) {
    const percent = Math.round(initVal.percentage * 100);
    if (mode === 'both' || mode === 'label') label.set_label(`${percent}%`);
    if (mode === 'both' || mode === 'icon')
      icon.set_icon(getBatteryIcon(initVal.percentage, initVal.charging));
  }

  service.subscribe((val) => {
    if (!val.visible) return;
    const percent = Math.round(val.percentage * 100);
    if (mode === 'both' || mode === 'label') label.set_label(`${percent}%`);
    if (mode === 'both' || mode === 'icon')
      icon.set_icon(getBatteryIcon(val.percentage, val.charging));
  });

  // Return appropriate widget
  if (mode === 'both') return box;
  if (mode === 'icon') return icon;
  return label; // label mode
}

function getBatteryIcon(percentage: number, charging: boolean): string {
  const pct = Math.round(percentage * 100);
  let icon: string;

  if (pct >= 95) icon = 'battery-full-symbolic';
  else if (pct >= 75) icon = 'battery-good-symbolic';
  else if (pct >= 50) icon = 'battery-medium-symbolic';
  else if (pct >= 20) icon = 'battery-low-symbolic';
  else icon = 'battery-caution-symbolic';

  if (charging) {
    icon = icon.replace('-symbolic', '-charging-symbolic');
  }

  return icon;
}
