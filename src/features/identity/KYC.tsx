import React, { FC, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardHeader } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage, useIntl } from "react-intl";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import { RootState } from "../../app/rootReducer";
import { sha256, toHex } from "../../utils/identity";
import TooltipIcon from "../../components/Tooltip";
import { createIdentity } from "./IdentitySlice";

enum TestIds {
  CREATE_ID = "CREATE_ID",
}

const useStyles = makeStyles(() => ({
  card: {
    minHeight: "300px",
    minWidth: "400px",
    maxWidth: "400px",
    marginRight: "30px",
    marginBottom: "30px",
    border: "2px solid rgba(255, 255, 255, 0.2)",
  },
  submitButton: {
    width: "100%",
  },
  formControl: {
    width: "90%",
  },
}));
const KYC: FC = () => {
  const { loading } = useSelector((state: RootState) => state.global);
  const { connected } = useSelector((state: RootState) => state.wallet);
  const [email, setEmail] = useState("");
  const [attestation, setAttestation] = useState(new Uint8Array());
  const hash = useCallback(() => sha256(email), [email]);
  const dispatch = useDispatch();
  const intl = useIntl();
  const classes = useStyles();

  const updateEmail = (email: string) => {
    setEmail(email);
    hash().then(setAttestation);
  };

  return (
    <Card className={classes.card}>
      <CardHeader
        title={
          <span>
            <FormattedMessage id={"identity.kyc"} />
            <TooltipIcon text={"tooltip.identity.kyc"} />
          </span>
        }
      />

      <CardContent>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField
              label={intl.formatMessage({ id: "identity.email" })}
              required={true}
              value={email}
              onChange={(event) => updateEmail(event.target.value)}
              className={classes.formControl}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={intl.formatMessage({ id: "identity.attestation" })}
              disabled={true}
              value={toHex(attestation)}
              className={classes.formControl}
            />
          </Grid>
          <Grid item xs>
            <Button
              disabled={!!loading || !attestation || !connected}
              type="submit"
              variant="contained"
              color="primary"
              className={classes.submitButton}
              data-testid={TestIds.CREATE_ID}
              onClick={() => dispatch(createIdentity(attestation))}
            >
              <FormattedMessage id="identity.create" />
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default KYC;
