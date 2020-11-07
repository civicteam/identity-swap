// This module must be kept in-sync with spl-token.
// In future, these Layouts may exported by the spl-token client,
// in which case we will not need these.
import * as BufferLayout from "buffer-layout";
import { Layout } from "buffer-layout";

const publicKey = (property = "publicKey") => {
  return BufferLayout.blob(32, property);
};

const uint64 = (property = "uint64") => {
  return BufferLayout.blob(8, property);
};

export const MintLayout: Layout = BufferLayout.struct([
  BufferLayout.u32("mintAuthorityOption"),
  publicKey("mintAuthority"),
  uint64("supply"),
  BufferLayout.u8("decimals"),
  BufferLayout.u8("isInitialized"),
  BufferLayout.u32("freezeAuthorityOption"),
  publicKey("freezeAuthority"),
]);

export const AccountLayout: Layout = BufferLayout.struct([
  publicKey("mint"),
  publicKey("owner"),
  uint64("amount"),
  BufferLayout.u32("delegateOption"),
  publicKey("delegate"),
  BufferLayout.u8("state"),
  BufferLayout.u32("isNativeOption"),
  uint64("isNative"),
  uint64("delegatedAmount"),
  BufferLayout.u32("closeAuthorityOption"),
  publicKey("closeAuthority"),
]);

export const TokenSwapLayout = BufferLayout.struct([
  BufferLayout.u8("isInitialized"),
  BufferLayout.u8("nonce"),
  publicKey("tokenProgramId"),
  publicKey("tokenAccountA"),
  publicKey("tokenAccountB"),
  publicKey("tokenPool"),
  publicKey("mintA"),
  publicKey("mintB"),
  publicKey("feeAccount"),
  publicKey("idv"),
  BufferLayout.u8("curveType"),
  uint64("tradeFeeNumerator"),
  uint64("tradeFeeDenominator"),
  uint64("ownerTradeFeeNumerator"),
  uint64("ownerTradeFeeDenominator"),
  uint64("ownerWithdrawFeeNumerator"),
  uint64("ownerWithdrawFeeDenominator"),
  uint64("hostFeeNumerator"),
  uint64("hostFeeDenominator"),
]);
