import { ListBox } from '@/astalified/ListBox';
import { ListBoxRow } from '@/astalified/ListBoxRow';
import { ScrolledWindow } from '@/astalified/ScrolledWindow';
import { App, Gdk } from 'astal/gtk3';
import { Box, Label, Stack } from 'astal/gtk3/widget';
import Gtk from 'gi://Gtk?version=3.0';

export function Settings(mon: Gdk.Monitor): Gtk.Window {
  const main = new Gtk.Window({
    name: 'settings_window',
    application: App,
  });
  main.connect('delete-event', (widget, event) => {
    widget.hide();
    return true;
  });

  const mainBox = new Box({
    orientation: Gtk.Orientation.HORIZONTAL,
    spacing: 0,
    hexpand: true,
    vexpand: true,
  });

  // Sidebar
  const listBox = new ListBox({
    selection_mode: Gtk.SelectionMode.SINGLE,
    hexpand: false,
    valign: Gtk.Align.FILL,
  });

  const menuItems = ['Network', 'Display', 'Sound', 'Power', 'About'];

  for (const item of menuItems) {
    const row = new ListBoxRow({});
    const label = new Label({ label: item, xalign: 0 });
    row.add(label);
    listBox.add(row);
  }

  // Main Stack
  const stack = new Stack({
    transition_type: Gtk.StackTransitionType.SLIDE_LEFT_RIGHT,
    transition_duration: 250,
    hexpand: true,
    vexpand: true,
  });

  for (const item of menuItems) {
    const label = new Label({
      label: `${item} settings page`,
      halign: Gtk.Align.CENTER,
      valign: Gtk.Align.CENTER,
    });
    stack.add_named(label, item);
  }

  // Hook selection
  listBox.connect('row-selected', (box, row) => {
    if (row) {
      const label = (row.get_child() as Label).label;
      stack.set_visible_child_name(label);
    }
  });

  // Default selection
  listBox.select_row(listBox.get_row_at_index(0));

  const sidebar = new ScrolledWindow({
    min_content_width: 200,
    child: listBox,
  });

  mainBox.add(sidebar);
  mainBox.add(stack);
  main.add(mainBox);

  return main;
}
