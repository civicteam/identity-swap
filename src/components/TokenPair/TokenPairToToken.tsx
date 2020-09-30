import React, { FC } from "react";
import { useDispatch } from "react-redux";
import { SerializableTokenAccount } from "../../api/token/TokenAccount";
import { TokenPairState } from "../../utils/types";
import { TokenPairToken } from "./TokenPairToken";

enum TestIds {
  TOKEN_SELECTOR_TO = "TOKEN_SELECTOR_TO",
}

type TokenPairToTokenProps = {
  toAmount: number;
  fromTokenAccount?: SerializableTokenAccount;
  toTokenAccount?: SerializableTokenAccount;
  tokenAccounts: Array<SerializableTokenAccount>;
  loading: boolean;
  updateState: (state: Partial<TokenPairState>) => void;
  cardHeaderTitle: string;
};

export const TokenPairToToken: FC<TokenPairToTokenProps> = (
  props: TokenPairToTokenProps
) => {
  const dispatch = useDispatch();

  const {
    tokenAccounts,
    toAmount,
    toTokenAccount,
    updateState,
    loading,
    cardHeaderTitle,
  } = props;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectToTokenHandleChange = (event: any) => {
    const index = event.target.value;
    const token = tokenAccounts.find((token) => token.mint?.symbol === index);
    if (token) {
      dispatch(updateState({ toTokenAccount: token }));
    }
  };

  return (
    <TokenPairToken
      tokenAccount={toTokenAccount}
      amount={toAmount}
      selectTokenHandleChange={selectToTokenHandleChange}
      showMaxButton={false}
      cardHeaderTitle={cardHeaderTitle}
      disableAmountInput={true}
      loading={loading}
      tokenAccounts={tokenAccounts}
      data-testid={TestIds.TOKEN_SELECTOR_TO}
    />
  );
};
