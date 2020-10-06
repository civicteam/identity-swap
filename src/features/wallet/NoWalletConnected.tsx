import IconButton from "@material-ui/core/IconButton";
import {
  Typography,
  Drawer,
  Hidden,
  Theme,
  createStyles,
  Box,
} from "@material-ui/core";
import ToggleOff from "@material-ui/icons/ToggleOff";
import React, { FC } from "react";
import { Cluster } from "@solana/web3.js";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { ArrowLeft } from "@material-ui/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { WalletType } from "../../api/wallet";
import { ClusterSelector } from "./ClusterSelector";
import { WalletSelector } from "./WalletSelector";

enum TestIds {
  WALLET_MENU_DRAWER = "WALLET_MENU_DRAWER",
  WALLET_CONNECTOR = "WALLET_CONNECTOR",
}

const drawerWidth = 240;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    drawer: {
      [theme.breakpoints.up("sm")]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    appBar: {
      [theme.breakpoints.up("sm")]: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
      },
    },
    menuButton: {
      marginRight: theme.spacing(0),
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
      width: drawerWidth,
      backgroundColor: theme.palette.primary.dark,
    },
    formControl: {
      padding: theme.spacing(3),
    },
    content: {
      flexGrow: 1,
      paddingBottom: theme.spacing(3),
    },
  })
);

type Props = {
  connectWallet: () => void;
  cluster: Cluster;
  selectCluster: (selected: Cluster) => void;
  walletType: WalletType;
  selectWalletType: (selected: WalletType) => void;
  window?: () => Window;
};
export const NoWalletConnected: FC<Props> = ({
  connectWallet,
  cluster,
  selectCluster,
  walletType,
  selectWalletType,
  window,
}: Props) => {
  const intl = useIntl();
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const container =
    window !== undefined ? () => window().document.body : undefined;
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div>
      <IconButton
        color="inherit"
        data-testid={TestIds.WALLET_CONNECTOR}
        onClick={connectWallet}
      >
        <Typography variant={"caption"}>
          <FormattedMessage id="wallet.connect" />
        </Typography>
        <ToggleOff />
      </IconButton>
      <IconButton
        color="inherit"
        aria-label={intl.formatMessage({ id: "wallet.config.open" })}
        edge="end"
        onClick={handleDrawerToggle}
        className={classes.menuButton}
        data-testid={TestIds.WALLET_MENU_DRAWER}
      >
        <ArrowLeft />
      </IconButton>
      <Hidden implementation="css">
        <Drawer
          container={container}
          variant="temporary"
          anchor={"right"}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          classes={{
            paper: classes.drawerPaper,
          }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          <Box className={classes.formControl}>
            <ClusterSelector select={selectCluster} current={cluster} />
          </Box>
          <Box className={classes.formControl}>
            <WalletSelector current={walletType} select={selectWalletType} />
          </Box>
        </Drawer>
      </Hidden>
    </div>
  );
};
