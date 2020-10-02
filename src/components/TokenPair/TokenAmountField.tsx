import TextField from "@material-ui/core/TextField";
import React, { ChangeEvent, FC, useCallback, useState } from "react";
import { InputLabelProps } from "@material-ui/core";
import { Token } from "../../api/token/Token";
import { majorAmountToMinor, minorAmountToMajor } from "../../utils/amount";
import { useIntl } from "react-intl";
import { IntlNumberParser } from "../../utils/IntlNumberParser";

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
  label = "tokenAmountField.defaultLabel",
  amount = 0,
  token,
  loading = false,
  updateAmount,
  dataTestId,
  disabled = loading || !token || !updateAmount,
  required = false,
  inputLabelProps = {},
}: Props) => {
  const intl = useIntl();
  const intlNumberParser = new IntlNumberParser(intl.locale);

  const parseNumber = (numberString: string) =>
    intlNumberParser.parse(numberString);

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
    updateApplicationState(parseNumber(valueString));
  };

  const getValue = useCallback(
    () =>
      disabled && token
        ? intl.formatNumber(Number(minorAmountToMajor(amount, token)))
        : value,
    [disabled, token, amount, value, intl]
  );

  return (
    <TextField
      label={intl.formatMessage({ id: label })}
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
