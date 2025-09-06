import { GObject } from 'astal';
import { astalify, ConstructProps, Gtk } from 'astal/gtk3';

// ScrolledWindow
export class ScrolledWindow extends astalify(Gtk.ScrolledWindow) {
  static {
    GObject.registerClass(this);
  }
  constructor(props: ConstructProps<ScrolledWindow, Gtk.ScrolledWindow.ConstructorProps>) {
    super(props as any);
  }
}
