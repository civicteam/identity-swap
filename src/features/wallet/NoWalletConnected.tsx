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
import CircularProgress from "@material-ui/core/CircularProgress";
import React, { FC } from "react";
import { Cluster } from "@solana/web3.js";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { ArrowLeft } from "@material-ui/icons";
import { WalletType } from "../../api/wallet";
import { ClusterSelector } from "./ClusterSelector";
import { WalletSelector } from "./WalletSelector";

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
  loading: boolean;
  cluster: Cluster;
  selectCluster: (selected: Cluster) => void;
  walletType: WalletType;
  selectWalletType: (selected: WalletType) => void;
  window?: () => Window;
};
export const NoWalletConnected: FC<Props> = ({
  connectWallet,
  loading,
  cluster,
  selectCluster,
  walletType,
  selectWalletType,
  window,
}: Props) => {
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const container =
    window !== undefined ? () => window().document.body : undefined;
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div>
      <IconButton color="inherit" onClick={connectWallet}>
        <Typography variant={"caption"}>Connect wallet</Typography>
        <ToggleOff />
        {loading && <CircularProgress color="secondary" />}
      </IconButton>
      <IconButton
        color="inherit"
        aria-label="open wallet configuration drawer"
        edge="end"
        onClick={handleDrawerToggle}
        className={classes.menuButton}
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
