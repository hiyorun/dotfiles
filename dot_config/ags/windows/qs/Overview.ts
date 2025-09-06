import { Battery } from "@/widgets/battery/Battery";
import { Box } from "astal/gtk3/widget";

export function OverviewBox(): Box {
  const main = new Box()

  main.add(Battery())

  return main
}
