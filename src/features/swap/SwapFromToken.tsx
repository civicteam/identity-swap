import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/rootReducer";
import {
  selectFromToken,
  setFromAmount,
  setToAmount,
  selectPoolForTokenPair,
} from "./SwapSlice";
import { SwapToken } from "./SwapToken";

export const SwapFromToken: FC = () => {
  const dispatch = useDispatch();

  const { fromToken, tokens, fromAmount } = useSelector(
    (state: RootState) => state.swap
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectFromTokenHandleChange = (event: any) => {
    const index = event.target.value;
    const token = tokens.find((token) => token.symbol === index);
    if (token) {
      dispatch(selectFromToken(token));
      dispatch(selectPoolForTokenPair());
    }
  };

  const setMaxFromAmount = () => {
    // TODO is there fees here and I should reduce some value?
    if (fromToken) dispatch(setFromAmount(fromToken.balance));
  };

  const updateFromAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fromAmountValue = parseInt(event.target.value);
    dispatch(setFromAmount(isNaN(fromAmountValue) ? 0 : fromAmountValue));
    dispatch(setToAmount());
  };

  return (
    <SwapToken
      token={fromToken}
      amount={fromAmount}
      selectTokenHandleChange={selectFromTokenHandleChange}
      setMaxAmount={setMaxFromAmount}
      updateAmount={updateFromAmount}
      showMaxButton={true}
      cardHeaderTitle="From"
      disableAmountInput={false}
    />
  );
};
