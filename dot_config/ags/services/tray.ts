import { Variable } from 'astal';
import { Subscribable } from 'astal/binding';
import Trayd from 'gi://AstalTray';
import { Astal, Gtk } from 'astal/gtk3';
import { Button, Icon } from 'astal/gtk3/widget';

class TrayService implements Subscribable {
  private map: Map<string, Gtk.Widget> = new Map();
  private var: Variable<Array<Gtk.Widget>> = Variable([]);

  constructor() {
    const trayd = Trayd.get_default();

    trayd.connect('item-added', (_tray, id) => {
      const item = trayd.get_item(id);
      item.connect('changed', () => {
        this.set(id, item);
      });
      if (item.id === null) return;
      this.set(id, item);
    });

    trayd.connect('item-removed', (_tray, id) => {
      this.delete(id);
    });

    trayd.items?.forEach((item) => {
      this.set(item.id, item);
    });
  }

  private set(key: string, item: Trayd.TrayItem) {
    const widget = this.constructButton(item);

    this.map.get(key)?.destroy();
    this.map.set(key, widget);
    this.var.set([...this.map.values()]);
  }

  private delete(key: string) {
    this.map.get(key)?.destroy();
    this.map.delete(key);
    this.var.set([...this.map.values()]);
  }

  private constructButton(item: Trayd.TrayItem): Gtk.Widget {
    const button = new Button();
    button.get_style_context().add_class('tray-item');
    button.add(new Icon({ gicon: item.get_gicon(), className: 'tray-icon' }));

    const position = button.get_pointer();
    button.connect('click', (_src, evt) => {
      if (evt.button === Astal.MouseButton.SECONDARY) {
        const menu = Gtk.Menu.new_from_model(item.menu_model);
        menu.insert_action_group('dbusmenu', item.action_group);
        menu.popup_at_pointer(null);
        return;
      }
      item.activate(position[0], position[1]);
    });

    return button;
  }

  get() {
    return this.var.get();
  }

  subscribe(callback: (list: Array<Gtk.Widget>) => void) {
    return this.var.subscribe(callback);
  }
}

export default TrayService;
