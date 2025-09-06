// wrap-missing.ts
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=3.0';
import { astalify, type ConstructProps } from 'astal/gtk3';

// ListBoxRow
export class ListBoxRow extends astalify(Gtk.ListBoxRow) {
  static {
    GObject.registerClass(this);
  }
  constructor(props: ConstructProps<ListBoxRow, Gtk.ListBoxRow.ConstructorProps>) {
    super(props as any);
  }
}
