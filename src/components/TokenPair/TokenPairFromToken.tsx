import React from "react";
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
  selectPoolForTokenPair: () => void;
  setFromAmount: (amount: number) => void;
  setToAmount: () => void;
  loading: boolean;
};

enum TestIds {
  TOKEN_SELECTOR_FROM = "SWAP_TOKEN_SELECTOR_FROM",
}
export const TokenPairFromToken = (
  props: TokenPairFromTokenProps
): JSX.Element => {
  const dispatch = useDispatch();

  const {
    fromTokenAccount,
    tokenAccounts,
    fromAmount,
    selectFromTokenAccount,
    selectPoolForTokenPair,
    setFromAmount,
    setToAmount,
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
      dispatch(selectPoolForTokenPair());
    }
  };

  const setMaxFromAmount = () => {
    if (fromTokenAccount) dispatch(setFromAmount(fromTokenAccount.balance));
  };

  const updateFromAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fromAmountValue = parseInt(event.target.value);
    dispatch(setFromAmount(isNaN(fromAmountValue) ? 0 : fromAmountValue));
    dispatch(setToAmount());
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
