import React, { FC } from "react";

import { createStyles, Drawer, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Hidden from "@material-ui/core/Hidden";
import { DevWindow } from "../../types/global";
import { drawerWidth } from "./CivicAppBar";
import Menu from "./Menu";

declare let window: DevWindow;

const useStyles = makeStyles(() =>
  createStyles({
    drawerPaper: {
      width: drawerWidth,
    },
  })
);

type Props = {
  open: boolean;
  handleDrawerClose: () => void;
};
const MenuDrawer: FC<Props> = ({ open, handleDrawerClose }: Props) => {
  const classes = useStyles();
  const theme = useTheme();
  const container =
    window !== undefined ? () => window.document.body : undefined;

  return (
    <>
      <Hidden smUp implementation="css">
        <Drawer
          container={container}
          variant="temporary"
          anchor={theme.direction === "rtl" ? "right" : "left"}
          open={open}
          onClose={handleDrawerClose}
          classes={{
            paper: classes.drawerPaper,
          }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          <Menu />
        </Drawer>
      </Hidden>
      <Hidden xsDown implementation="css">
        <Drawer
          classes={{
            paper: classes.drawerPaper,
          }}
          variant="permanent"
          open
        >
          <Menu />
        </Drawer>
      </Hidden>
    </>
  );
};

export default MenuDrawer;
