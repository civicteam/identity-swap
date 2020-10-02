import React, { FC } from "react";
import { useSelector } from "react-redux";
import { FormattedMessage } from "react-intl";
import { RootState } from "../app/rootReducer";
import { getExplorerUrl } from "../utils/connection";

type Props = {
  txSignature: string;
};
export const ViewTxOnExplorer: FC<Props> = ({ txSignature }: Props) => {
  const cluster = useSelector((state: RootState) => state.wallet.cluster);
  const url = getExplorerUrl(cluster, txSignature);
  return (
    <a color="inherit" target="_blank" rel="noopener noreferrer" href={url}>
      <FormattedMessage id="notification.info.viewOnExplorer" />
    </a>
  );
};
