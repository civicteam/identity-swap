import React, { FC } from "react";
import { Typography } from "@material-ui/core";
import { FormattedMessage } from "react-intl";

const CreateIdentityButton: FC = () => (
  <>
    <Typography>
      <FormattedMessage id="identity.create.menu" />
    </Typography>
  </>
);
export default CreateIdentityButton;
