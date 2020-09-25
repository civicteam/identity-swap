import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/rootReducer";
import { selectToTokenAccount, selectPoolForTokenPair } from "./SwapSlice";
import { SwapToken } from "./SwapToken";

export const SwapToToken: FC = () => {
  const dispatch = useDispatch();

  const { tokenAccounts, toAmount, toTokenAccount } = useSelector(
    (state: RootState) => state.swap
  );

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
    <SwapToken
      tokenAccount={toTokenAccount}
      amount={toAmount}
      selectTokenHandleChange={selectToTokenHandleChange}
      showMaxButton={false}
      cardHeaderTitle="To"
      disableAmountInput={true}
    />
  );
};
