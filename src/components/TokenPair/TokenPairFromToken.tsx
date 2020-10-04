import React, { FC } from "react";
import { useDispatch } from "react-redux";
import { TokenAccount } from "../../api/token/TokenAccount";
import { TokenPairUpdate } from "../../utils/types";
import { Token } from "../../api/token/Token";
import { Pool } from "../../api/pool/Pool";
import { TokenPairToken } from "./TokenPairToken";

type TokenPairFromTokenProps = {
  fromAmount: number;
  fromToken?: Token;
  fromTokenAccount?: TokenAccount;
  toTokenAccount?: TokenAccount;
  tokenAccounts: Array<TokenAccount>;
  loading: boolean;
  updateState: (state: Partial<TokenPairUpdate>) => void;
  cardHeaderTitle: string;
  selectedPool?: Pool;
  getTokenABalance?: () => number;
  getTokenBBalance?: () => number;
};

enum TestIds {
  TOKEN_SELECTOR_FROM = "TOKEN_SELECTOR_FROM",
}
export const TokenPairFromToken: FC<TokenPairFromTokenProps> = (
  props: TokenPairFromTokenProps
) => {
  const dispatch = useDispatch();

  const {
    fromToken,
    fromTokenAccount,
    tokenAccounts,
    fromAmount,
    updateState,
    loading,
    cardHeaderTitle,
    getTokenABalance,
    getTokenBBalance,
    selectedPool,
  } = props;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectFromTokenHandleChange = (event: any) => {
    const index = event.target.value;
    const selectedTokenAccount = tokenAccounts.find(
      (tokenAccount) => tokenAccount.mint.symbol === index
    );
    if (selectedTokenAccount) {
      dispatch(updateState({ fromTokenAccount: selectedTokenAccount }));
    }
  };

  const updateFromAmount = (minorAmount: number) => {
    dispatch(updateState({ fromAmount: minorAmount }));
  };

  const setMaxFromAmount = () => {
    if (fromTokenAccount) updateFromAmount(fromTokenAccount.balance);
  };

  return (
    <TokenPairToken
      token={fromToken}
      tokenAccount={fromTokenAccount}
      amount={fromAmount}
      selectTokenHandleChange={selectFromTokenHandleChange}
      setMaxAmount={setMaxFromAmount}
      updateAmount={updateFromAmount}
      showMaxButton={true}
      cardHeaderTitle={cardHeaderTitle}
      loading={loading}
      tokenAccounts={tokenAccounts}
      data-testid={TestIds.TOKEN_SELECTOR_FROM}
      getTokenABalance={getTokenABalance}
      getTokenBBalance={getTokenBBalance}
      selectedPool={selectedPool}
    />
  );
};
