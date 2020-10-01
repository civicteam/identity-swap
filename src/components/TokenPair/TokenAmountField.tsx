import TextField from "@material-ui/core/TextField";
import React, { ChangeEvent, FC, useCallback, useState } from "react";
import { InputLabelProps } from "@material-ui/core";
import { Token } from "../../api/token/Token";
import { majorAmountToMinor, minorAmountToMajor } from "../../utils/amount";

type Props = {
  label?: string;
  amount?: number;
  updateAmount?: (minorAmount: number) => void;
  token?: Token;
  loading?: boolean;
  dataTestId: string;
  disabled?: boolean;
  required?: boolean;
  inputLabelProps?: Partial<InputLabelProps>;
};
const TokenAmountField: FC<Props> = ({
  label = "Enter amount",
  amount = 0,
  token,
  loading = false,
  updateAmount,
  dataTestId,
  disabled = loading || !token || !updateAmount,
  required = false,
  inputLabelProps = {},
}: Props) => {
  const [value, setValue] = useState("" + amount);

  const updateApplicationState = (majorAmount: number) =>
    token &&
    updateAmount &&
    updateAmount(majorAmountToMinor(majorAmount, token));

  const valueHasChanged = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const valueString = event.target.value;
    setValue(valueString);
    updateApplicationState(Number(valueString));
  };

  const getValue = useCallback(
    () => (disabled && token ? minorAmountToMajor(amount, token) : value),
    [disabled, token, amount, value]
  );

  return (
    <TextField
      label={label}
      disabled={disabled}
      required={required}
      value={getValue()}
      onChange={valueHasChanged}
      InputLabelProps={inputLabelProps}
      data-testid={dataTestId}
    />
  );
};

export default TokenAmountField;
