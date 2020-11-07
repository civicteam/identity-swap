import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SerializableIdentity } from "../../api/identity/Identity";
import { RootState } from "../../app/rootReducer";
import { APIFactory as IdentityAPIFactory } from "../../api/identity";

const IDENTITY_SLICE_NAME = "identity";

export interface IdentityState {
  identities: Array<SerializableIdentity>;
  selectedIdentity?: SerializableIdentity;
}

const initialState: IdentityState = {
  identities: [],
};

export const getIdentities = createAsyncThunk(
  IDENTITY_SLICE_NAME + "/getIdentities",
  async (arg, thunkAPI): Promise<Array<SerializableIdentity>> => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const IdentityAPI = IdentityAPIFactory(walletState.cluster);

    const identities = await IdentityAPI.getIdentities();

    return identities.map((identity) => identity.serialize());
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
  },
  extraReducers: (builder) => {
    builder.addCase(getIdentities.fulfilled, (state, action) => ({
      ...state,
      identities: action.payload,
    }));
  },
});
export const { selectIdentity } = identitySlice.actions;
export default identitySlice.reducer;
