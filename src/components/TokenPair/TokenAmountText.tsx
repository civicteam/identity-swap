import React, { FC, useCallback } from "react";
import { FormattedNumber } from "react-intl";
import { Token } from "../../api/token/Token";

type Props = {
  amount: number;
  token: Token;
};
const TokenAmountText: FC<Props> = ({ amount, token }: Props) => {
  const getAmount = useCallback(
    () => Number(token.toMajorDenomination(amount)),
    [token, amount]
  );

  return <FormattedNumber value={getAmount()} />;
};

export default TokenAmountText;
