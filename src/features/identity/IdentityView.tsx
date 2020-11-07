import React, { FC } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { List } from "@material-ui/core";
import { RootState } from "../../app/rootReducer";
import { selectIdentity } from "./IdentitySlice";
import { IdentitySelector } from "./IdentitySelector";

const IdentityView: FC = () => {
  const identityState = useSelector(
    (state: RootState) => state.identity,
    shallowEqual
  );
  const dispatch = useDispatch();

  return (
    <>
      <List>
        <IdentitySelector
          select={(identity) => dispatch(selectIdentity(identity))}
          current={identityState.selectedIdentity}
          available={identityState.identities}
        />
      </List>
    </>
  );
};

export default IdentityView;
