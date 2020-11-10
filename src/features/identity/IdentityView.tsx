import React, { FC } from "react";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import IdentityDetailsPanel from "./IdentityDetailsPanel";
import KYC from "./KYC";
import CivicPanel from "./CivicPanel";

export const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "none",
    padding: "15px",
  },
  media: {
    height: 0,
    paddingTop: "56.25%", // 16:9
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  selectTokenButton: {
    marginTop: "12px",
    fontSize: "9px",
  },
  formControl: {
    width: "100%",
  },
}));
export const IdentityView: FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item>
          <IdentityDetailsPanel />
        </Grid>
        <Grid item>
          <KYC />
        </Grid>
        <Grid item>
          <CivicPanel />
        </Grid>
      </Grid>
    </div>
  );
};
