import React, { FC } from "react";
import { makeStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import { IconButton } from "@material-ui/core";
import { useIntl } from "react-intl";
import { TokenAccount } from "../../api/token/TokenAccount";
import { abbreviateAddress } from "../../utils/string";
import { Token } from "../../api/token/Token";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
}));

type TokenAccountSelectorProps = {
  selectedTokenAccount?: TokenAccount;
  tokenAccounts: Array<TokenAccount>;
  selectTokenAccountHandleChange: (tokenAccount?: TokenAccount) => void;
  allowEmptyTokenAccount?: boolean;
};

export const TokenAccountSelector: FC<TokenAccountSelectorProps> = (
  props: TokenAccountSelectorProps
) => {
  const intl = useIntl();
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const {
    tokenAccounts,
    selectTokenAccountHandleChange,
    selectedTokenAccount,
    allowEmptyTokenAccount,
  } = props;

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number
  ) => {
    setAnchorEl(null);

    if (index === -1) {
      selectTokenAccountHandleChange(undefined);
    } else {
      const tokenAccount = tokenAccounts[index];
      selectTokenAccountHandleChange(tokenAccount);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getFormattedLabel = (
    address: string,
    balance: number,
    token: Token
  ) => {
    return intl.formatMessage(
      {
        id: "tokenPairTokenAccountSelector.label",
      },
      { address, balance: Number(token.toMajorDenomination(balance)) }
    );
  };

  return (
    <div className={classes.root}>
      <IconButton onClick={handleClick} size="small">
        <AccountBalanceWalletIcon />
      </IconButton>
      <Menu
        id="lock-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {allowEmptyTokenAccount && (
          <MenuItem
            key="noTokenAccount"
            selected={!selectedTokenAccount}
            onClick={(event) => handleMenuItemClick(event, -1)}
          >
            {intl.formatMessage({
              id: "tokenPairTokenAccountSelector.createNew",
            })}
          </MenuItem>
        )}
        {tokenAccounts.map((tokenAccount, index) => (
          <MenuItem
            key={tokenAccount.address.toBase58()}
            selected={selectedTokenAccount?.equals(tokenAccount)}
            onClick={(event) => handleMenuItemClick(event, index)}
          >
            {getFormattedLabel(
              abbreviateAddress(tokenAccount.address.toBase58()),
              tokenAccount.balance.toNumber(),
              tokenAccount.mint
            )}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};
