import React, { FC } from "react";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { red } from "@material-ui/core/colors";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    padding: "15px",
  },
  card: {
    width: 450,
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
  expandOpen: {
    transform: "rotate(180deg)",
  },
  avatar: {
    backgroundColor: red[500],
  },
  maxButton: {
    color: "#DC004E",
    border: "1px solid rgb(220, 0, 78)",
  },
}));

export const PoolsAdd: FC = () => {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={classes.root}>
      <Card className={classes.card}>
        <CardHeader title="Add Liquidity" />
        <CardContent>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Button variant="outlined">Select Token</Button>
            </Grid>
            <Grid item xs={3}>
              <TextField
                disabled
                id="outlined-disabled"
                label="Balance"
                defaultValue="0"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={3}>
              <TextField id="outlined" variant="outlined" label="Input" />
            </Grid>
            <Grid item xs={2}>
              <Button variant="outlined" className={classes.maxButton}>
                MAX
              </Button>
            </Grid>
          </Grid>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              +
            </Grid>
          </Grid>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Button variant="outlined">Select Token</Button>
            </Grid>
            <Grid item xs={3}>
              <TextField
                disabled
                id="outlined-disabled"
                label="Balance"
                defaultValue="0"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={3}>
              <TextField id="outlined" variant="outlined" label="Input" />
            </Grid>
            <Grid item xs={2}>
              <Button variant="outlined" className={classes.maxButton}>
                MAX
              </Button>
            </Grid>
          </Grid>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              Prices and pool share
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="standard-basic"
                label="USDC per ETH"
                value="377.676"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="standard-basic"
                label="ETH per USDC"
                value="0.00264777"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="standard-basic"
                label="Share of Pool"
                value="0.05%"
              />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions disableSpacing>
          <IconButton
            className={clsx(classes.expand, {
              [classes.expandOpen]: expanded,
            })}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </IconButton>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography paragraph>
              When you add liquidity you are given pool tokens representing your
              position. These tokens automatically earn fees proportional to
              your share of the pool, and can be redeemed at any time.
            </Typography>
          </CardContent>
        </Collapse>
      </Card>
    </div>
  );
};
