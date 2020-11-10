import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Card, CardHeader, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage, useIntl } from "react-intl";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import { RootState } from "../../app/rootReducer";
import TooltipIcon from "../../components/Tooltip";

const useStyles = makeStyles(() => ({
  card: {
    minHeight: "300px",
    minWidth: "400px",
    maxWidth: "400px",
    marginRight: "30px",
    marginBottom: "30px",
    border: "2px solid rgba(255, 255, 255, 0.2)",
  },
  formControl: {
    width: "90%",
  },
  noIdentityIndicator: {
    width: "90%",
  },
  noIdentityInstructions: {
    padding: "10px",
  },
}));
const IdentityDetailsPanel: FC = () => {
  const {
    identity: { selectedIdentity },
    global: { loading },
  } = useSelector((state: RootState) => state);
  const intl = useIntl();
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardHeader
        title={
          <span>
            <FormattedMessage id={"identity.details"} />
            <TooltipIcon text={"tooltip.identity.details"} />
          </span>
        }
      />
      <CardContent>
        <Grid container spacing={1}>
          {!!loading ||
          !selectedIdentity ||
          selectedIdentity.attestations.length === 0 ? (
            <div className={classes.noIdentityIndicator}>
              <Typography variant={"h6"}>
                <FormattedMessage id="identity.none" />
              </Typography>
              <Typography
                className={classes.noIdentityInstructions}
                variant={"subtitle1"}
                align={"left"}
                color={"textPrimary"}
              >
                <FormattedMessage id="identity.none.instructions" />
              </Typography>
            </div>
          ) : (
            <>
              <Grid item xs={12}>
                <TextField
                  className={classes.formControl}
                  disabled
                  label={intl.formatMessage({ id: "identity.address" })}
                  value={selectedIdentity.address}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  className={classes.formControl}
                  disabled
                  label={intl.formatMessage({ id: "identity.idv" })}
                  value={selectedIdentity.attestations[0].idv}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs>
                <TextField
                  className={classes.formControl}
                  disabled
                  label={intl.formatMessage({ id: "identity.attestation" })}
                  value={selectedIdentity.attestations[0].attestationData}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default IdentityDetailsPanel;
