import { makeStyles } from "@material-ui/core/styles";
import React, { FC } from "react";
import { Button, Typography } from "@material-ui/core";
import { FormattedMessage } from "react-intl";

const useStyles = makeStyles(() => ({
  actionButton: {
    minWidth: "25px",
    "margin-left": "5px",
  },
  actionIconButton: {
    padding: "4px",
  },
}));

type CreateIdentityButtonProps = {
  loading: boolean;
};
const CreateIdentityButton: FC<CreateIdentityButtonProps> = ({
  loading,
}: CreateIdentityButtonProps) => {
  const classes = useStyles();
  return (
    <>
      <Typography>
        <FormattedMessage id="identity.none" />
      </Typography>
      <Button
        disabled={loading}
        variant="contained"
        color="primary"
        className={classes.actionButton}
      >
        <FormattedMessage id="identity.create" />
      </Button>
    </>
  );
};
export default CreateIdentityButton;
