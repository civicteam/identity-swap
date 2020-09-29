import React, { FC } from "react";
import { useDispatch } from "react-redux";
import { SerializableTokenAccount } from "../../api/token/TokenAccount";
import { TokenPairToken } from "./TokenPairToken";

type TokenPairFromTokenProps = {
  fromAmount: number;
  fromTokenAccount?: SerializableTokenAccount;
  toTokenAccount?: SerializableTokenAccount;
  tokenAccounts: Array<SerializableTokenAccount>;
  selectFromTokenAccount: (
    selectedTokenAccount: SerializableTokenAccount
  ) => void;
  setFromAmount: (amount: number) => void;
  loading: boolean;
};

enum TestIds {
  TOKEN_SELECTOR_FROM = "TOKEN_SELECTOR_FROM",
}
export const TokenPairFromToken: FC<TokenPairFromTokenProps> = (
  props: TokenPairFromTokenProps
) => {
  const dispatch = useDispatch();

  const {
    fromTokenAccount,
    tokenAccounts,
    fromAmount,
    selectFromTokenAccount,
    setFromAmount,
    loading,
  } = props;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectFromTokenHandleChange = (event: any) => {
    const index = event.target.value;
    const selectedTokenAccount = tokenAccounts.find(
      (tokenAccount) => tokenAccount.mint.symbol === index
    );
    if (selectedTokenAccount) {
      dispatch(selectFromTokenAccount(selectedTokenAccount));
    }
  };

  const setMaxFromAmount = () => {
    if (fromTokenAccount) dispatch(setFromAmount(fromTokenAccount.balance));
  };

  const updateFromAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fromAmountValue = parseInt(event.target.value);
    dispatch(setFromAmount(isNaN(fromAmountValue) ? 0 : fromAmountValue));
  };

  return (
    <TokenPairToken
      tokenAccount={fromTokenAccount}
      amount={fromAmount}
      selectTokenHandleChange={selectFromTokenHandleChange}
      setMaxAmount={setMaxFromAmount}
      updateAmount={updateFromAmount}
      showMaxButton={true}
      cardHeaderTitle="From"
      disableAmountInput={false}
      loading={loading}
      tokenAccounts={tokenAccounts}
      data-testid={TestIds.TOKEN_SELECTOR_FROM}
    />
  );
};
