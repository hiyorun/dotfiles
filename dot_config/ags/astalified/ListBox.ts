import { GObject } from 'astal';
import { astalify, ConstructProps, Gtk } from 'astal/gtk3';

// ListBox
export class ListBox extends astalify(Gtk.ListBox) {
  static {
    GObject.registerClass(this);
  }
  constructor(
    props: ConstructProps<
      ListBox,
      Gtk.ListBox.ConstructorProps,
      {
        onRowSelected?: [Gtk.ListBoxRow | null];
      }
    >,
  ) {
    super(props as any);
  }
}
