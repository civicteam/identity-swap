import React, { FC } from "react";
import { useDispatch } from "react-redux";
import { TokenAccount } from "../../api/token/TokenAccount";
import { TokenPairUpdate } from "../../utils/types";
import { Token } from "../../api/token/Token";
import { TokenPairToken } from "./TokenPairToken";

enum TestIds {
  TOKEN_SELECTOR_TO = "TOKEN_SELECTOR_TO",
}

type TokenPairToTokenProps = {
  toAmount: number;
  toToken?: Token;
  fromTokenAccount?: TokenAccount;
  toTokenAccount?: TokenAccount;
  tokenAccounts: Array<TokenAccount>;
  loading: boolean;
  updateState: (state: Partial<TokenPairUpdate>) => void;
  cardHeaderTitle: string;
};

export const TokenPairToToken: FC<TokenPairToTokenProps> = (
  props: TokenPairToTokenProps
) => {
  const dispatch = useDispatch();

  const {
    tokenAccounts,
    toAmount,
    toToken,
    toTokenAccount,
    updateState,
    loading,
    cardHeaderTitle,
  } = props;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectToTokenHandleChange = (event: any) => {
    const index = event.target.value;
    const token = tokenAccounts.find((token) => token.mint.symbol === index);
    if (token) {
      dispatch(updateState({ toTokenAccount: token }));
    }
  };

  return (
    <TokenPairToken
      tokenAccount={toTokenAccount}
      token={toToken}
      amount={toAmount}
      selectTokenHandleChange={selectToTokenHandleChange}
      showMaxButton={false}
      cardHeaderTitle={cardHeaderTitle}
      loading={loading}
      tokenAccounts={tokenAccounts}
      data-testid={TestIds.TOKEN_SELECTOR_TO}
    />
  );
};
