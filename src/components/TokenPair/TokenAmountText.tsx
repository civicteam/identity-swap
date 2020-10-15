import React, { FC, useCallback } from "react";
import { FormattedNumber } from "react-intl";
import { Decimal } from "decimal.js";
import { Token } from "../../api/token/Token";

type Props = {
  amount: number | Decimal;
  token: Token;
};
const TokenAmountText: FC<Props> = ({ amount, token }: Props) => {
  const getAmount = useCallback(
    () => Number(token.toMajorDenomination(new Decimal(amount).toNumber())),
    [token, amount]
  );

  return <FormattedNumber value={getAmount()} />;
};

export default TokenAmountText;
