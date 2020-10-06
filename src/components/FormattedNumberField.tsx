import TextField from "@material-ui/core/TextField";
import React, { FC, useCallback } from "react";
import { useIntl } from "react-intl";
import { isNil } from "ramda";

type Props = {
  label: string;
  value?: number;
  dataTestId: string;
};
const FormattedNumberField: FC<Props> = ({
  label,
  value,
  dataTestId,
}: Props) => {
  const intl = useIntl();
  const formattedNumber = useCallback(
    () => (!isNil(value) && intl.formatNumber(value)) || "",
    [value]
  );

  return (
    <TextField
      disabled
      label={intl.formatMessage({ id: label })}
      data-testid={dataTestId}
      value={formattedNumber()}
    />
  );
};

export default FormattedNumberField;
