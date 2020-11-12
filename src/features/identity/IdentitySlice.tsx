import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { omit } from "ramda";
import { Identity, SerializableIdentity } from "../../api/identity/Identity";
import { RootState } from "../../app/rootReducer";
import { APIFactory as IdentityAPIFactory } from "../../api/identity";
import { API as Civic, ScopeRequest } from "../../api/civic";

const IDENTITY_SLICE_NAME = "identity";

export interface IdentityState {
  identities: Array<SerializableIdentity>;
  selectedIdentity?: SerializableIdentity;
  scopeRequest?: ScopeRequest;
  identitiesLoaded: boolean;
}

const initialState: IdentityState = {
  identities: [],
  identitiesLoaded: false,
};

export const getIdentities = createAsyncThunk(
  IDENTITY_SLICE_NAME + "/getIdentities",
  async (arg, thunkAPI): Promise<Array<SerializableIdentity>> => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const IdentityAPI = IdentityAPIFactory(walletState.cluster);

    const identities = await IdentityAPI.getIdentities();

    if (identities.length > 0) {
      thunkAPI.dispatch(
        identitySlice.actions.selectIdentity(identities[0].serialize())
      );
    } else {
      thunkAPI.dispatch(identitySlice.actions.unselectIdentity());
    }

    return identities.map((identity) => identity.serialize());
  }
);

export const createIdentity = createAsyncThunk<
  SerializableIdentity,
  Uint8Array
>(
  IDENTITY_SLICE_NAME + "/attest",
  async (arg, thunkAPI): Promise<SerializableIdentity> => {
    const state: RootState = thunkAPI.getState() as RootState;
    const {
      wallet: { cluster },
      identity: { selectedIdentity },
    } = state;
    const IdentityAPI = IdentityAPIFactory(cluster);

    // create a new identity if there is not already one for this wallet.
    const identity = selectedIdentity
      ? Identity.from(selectedIdentity)
      : await IdentityAPI.createIdentity();

    await IdentityAPI.attest(identity, arg);

    const refreshedIdentity = await IdentityAPI.getIdentity(identity.address);

    thunkAPI.dispatch(getIdentities());

    return refreshedIdentity.serialize();
  }
);

export const waitForScopeRequest = createAsyncThunk<ScopeRequest, string>(
  IDENTITY_SLICE_NAME + "/waitForScopeRequest",
  async (uuid): Promise<ScopeRequest> => {
    await Civic.pollScopeRequestUntilDone(uuid);

    return Civic.getScopeRequest(uuid);
  }
);

export const createScopeRequest = createAsyncThunk<ScopeRequest>(
  IDENTITY_SLICE_NAME + "/createScopeRequest",
  async (arg, thunkAPI): Promise<ScopeRequest> => {
    const scopeRequest = await Civic.createScopeRequest();

    thunkAPI.dispatch(waitForScopeRequest(scopeRequest.uuid));

    return scopeRequest;
  }
);

/**
 * Redux slice containing the reducers for the identity
 */
const identitySlice = createSlice({
  name: IDENTITY_SLICE_NAME,
  initialState,
  reducers: {
    selectIdentity: (state, action: PayloadAction<SerializableIdentity>) => ({
      ...state,
      selectedIdentity: action.payload,
    }),
    unselectIdentity: omit(["selectedIdentity"]),
  },
  extraReducers: (builder) => {
    builder.addCase(getIdentities.fulfilled, (state, action) => ({
      ...state,
      identities: action.payload,
      identitiesLoaded: true,
    }));
    builder.addCase(createIdentity.fulfilled, (state, action) => ({
      ...state,
      selectedIdentity: action.payload,
    }));
    builder.addCase(createScopeRequest.fulfilled, (state, action) => ({
      ...state,
      scopeRequest: action.payload,
    }));
    builder.addCase(waitForScopeRequest.fulfilled, (state, action) => ({
      ...state,
      scopeRequest: action.payload,
    }));
  },
});
export const { selectIdentity } = identitySlice.actions;
export default identitySlice.reducer;
