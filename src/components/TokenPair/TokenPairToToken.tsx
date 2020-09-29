import React from "react";
import { useDispatch } from "react-redux";
import { SerializableTokenAccount } from "../../api/token/TokenAccount";
import { TokenPairToken } from "./TokenPairToken";

type TokenPairToTokenProps = {
  toAmount: number;
  fromTokenAccount?: SerializableTokenAccount;
  toTokenAccount?: SerializableTokenAccount;
  tokenAccounts: Array<SerializableTokenAccount>;
  selectToTokenAccount: (
    selectedTokenAccount: SerializableTokenAccount
  ) => void;
  selectPoolForTokenPair: () => void;
  setFromAmount: (amount: number) => void;
  setToAmount: () => void;
  loading: boolean;
};

export const TokenPairToToken = (props: TokenPairToTokenProps): JSX.Element => {
  const dispatch = useDispatch();

  const {
    tokenAccounts,
    toAmount,
    toTokenAccount,
    selectToTokenAccount,
    selectPoolForTokenPair,
    loading,
  } = props;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectToTokenHandleChange = (event: any) => {
    const index = event.target.value;
    const token = tokenAccounts.find((token) => token.mint?.symbol === index);
    if (token) {
      dispatch(selectToTokenAccount(token));
      dispatch(selectPoolForTokenPair());
    }
  };

  return (
    <TokenPairToken
      tokenAccount={toTokenAccount}
      amount={toAmount}
      selectTokenHandleChange={selectToTokenHandleChange}
      showMaxButton={false}
      cardHeaderTitle="To"
      disableAmountInput={true}
      loading={loading}
      tokenAccounts={tokenAccounts}
    />
  );
};
