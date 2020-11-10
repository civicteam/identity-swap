import React, { FC, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, CardHeader } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage, useIntl } from "react-intl";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import { path } from "ramda";
import { RootState } from "../../app/rootReducer";
import civicLogo from "../../components/CivicAppBar/Civic-logo-monogram-white-100px.png";
import { constructEmail, fromHex } from "../../utils/identity";
import { EmailClaim } from "../../api/civic";
import TooltipIcon from "../../components/Tooltip";
import { createIdentity, createScopeRequest } from "./IdentitySlice";

const useStyles = makeStyles(() => ({
  card: {
    minHeight: "300px",
    minWidth: "400px",
    maxWidth: "400px",
    marginRight: "30px",
    marginBottom: "30px",
    border: "2px solid rgba(255, 255, 255, 0.2)",
  },
  cardContent: {
    padding: "0px",
  },
  formControl: {
    width: "90%",
  },
  actionButton: {
    minWidth: "25px",
    "margin-left": "5px",
  },
  civicIcon: {
    width: "20px",
    "margin-left": "10px",
    "margin-right": "2px",
  },
  scopeRequest: {
    width: "300px",
  },
  submitButton: {
    width: "100%",
  },
}));
const CivicPanel: FC = () => {
  const {
    identity: { scopeRequest },
    global: { loading },
    wallet: { connected },
  } = useSelector((state: RootState) => state);
  const intl = useIntl();
  const classes = useStyles();
  const dispatch = useDispatch();

  const extractDataFromScopeRequest = useCallback((): [
    string | undefined,
    string | undefined
  ] => {
    if (!scopeRequest || scopeRequest.status !== "verification-success")
      return [undefined, undefined];
    const email = constructEmail(
      path<EmailClaim>(
        [
          "components",
          "identity",
          "response",
          "verifiableData",
          0,
          "credential",
          "claim",
        ],
        scopeRequest
      )
    );
    const attestation = path<string>(
      [
        "components",
        "identity",
        "response",
        "verifiableData",
        0,
        "credential",
        "proof",
        "merkleRoot",
      ],
      scopeRequest
    );
    return [email, attestation];
  }, [scopeRequest]);

  const [email, attestation] = extractDataFromScopeRequest();
  const attestOnSolana = () =>
    attestation && dispatch(createIdentity(fromHex(attestation)));

  return (
    <Card className={classes.card}>
      <CardHeader
        title={
          <span>
            <FormattedMessage id={"identity.civic"} />
            <TooltipIcon text={"tooltip.identity.civic"} />
          </span>
        }
      />
      <CardContent>
        <Grid container spacing={1}>
          {scopeRequest ? (
            <></>
          ) : (
            <Grid item xs={12}>
              <Button
                disabled={!!loading || !connected}
                variant="contained"
                color="primary"
                className={classes.actionButton}
                endIcon={
                  <img
                    className={classes.civicIcon}
                    src={civicLogo}
                    alt="Civic"
                  />
                }
                onClick={() => dispatch(createScopeRequest())}
              >
                <FormattedMessage id="identity.civic.connect" />
              </Button>
            </Grid>
          )}
          {scopeRequest &&
            scopeRequest.status === "awaiting-user" &&
            scopeRequest.access && (
              <Grid item xs>
                <img
                  alt="Civic Scope Request QR code"
                  className={classes.scopeRequest}
                  src={scopeRequest.access.imageUri}
                />
              </Grid>
            )}
          {scopeRequest && scopeRequest.status === "verification-success" && (
            <>
              <Grid item xs={12}>
                <TextField
                  label={intl.formatMessage({ id: "identity.email" })}
                  value={email}
                  className={classes.formControl}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={intl.formatMessage({ id: "identity.attestation" })}
                  disabled={true}
                  value={attestation}
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
                  onClick={attestOnSolana}
                >
                  <FormattedMessage id="identity.create" />
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CivicPanel;
