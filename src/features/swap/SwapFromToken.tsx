import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/rootReducer";
import {
  selectFromTokenAccount,
  setFromAmount,
  setToAmount,
  selectPoolForTokenPair,
} from "./SwapSlice";
import { SwapToken } from "./SwapToken";

enum TestIds {
  SWAP_TOKEN_SELECTOR_FROM = "SWAP_TOKEN_SELECTOR_FROM",
}

export const SwapFromToken: FC = () => {
  const dispatch = useDispatch();

  const { fromTokenAccount, tokenAccounts, fromAmount } = useSelector(
    (state: RootState) => state.swap
  );

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
    <SwapToken
      tokenAccount={fromTokenAccount}
      amount={fromAmount}
      selectTokenHandleChange={selectFromTokenHandleChange}
      setMaxAmount={setMaxFromAmount}
      updateAmount={updateFromAmount}
      showMaxButton={true}
      cardHeaderTitle="From"
      disableAmountInput={false}
      data-testid={TestIds.SWAP_TOKEN_SELECTOR_FROM}
    />
  );
};
