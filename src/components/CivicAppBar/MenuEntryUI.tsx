import React, { FC } from "react";
import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";

type MenuEntryUIProps = {
  icon: JSX.Element;
  text: string;
  dataTestId: string;
};
const MenuEntryUI: FC<MenuEntryUIProps> = ({
  text,
  icon,
  dataTestId,
}: MenuEntryUIProps) => (
  <ListItem button key={text} data-testid={dataTestId}>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText primary={text} />
  </ListItem>
);

export default MenuEntryUI;
