import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/rootReducer";
import { selectToToken, selectPoolForTokenPair } from "./SwapSlice";
import { SwapToken } from "./SwapToken";

export const SwapToToken: FC = () => {
  const dispatch = useDispatch();

  const { tokens, toAmount, toToken } = useSelector(
    (state: RootState) => state.swap
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectToTokenHandleChange = (event: any) => {
    const index = event.target.value;
    const token = tokens.find((token) => token.symbol === index);
    if (token) {
      dispatch(selectToToken(token));
      dispatch(selectPoolForTokenPair());
    }
  };

  return (
    <SwapToken
      token={toToken}
      amount={toAmount}
      selectTokenHandleChange={selectToTokenHandleChange}
      showMaxButton={false}
      cardHeaderTitle="To"
      disableAmountInput={true}
    />
  );
};
