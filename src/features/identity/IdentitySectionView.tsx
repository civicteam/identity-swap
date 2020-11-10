import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { makeStyles } from "@material-ui/core/styles";
import IdentityIcon from "@material-ui/icons/PermIdentity";
import { abbreviateAddress } from "../../utils/string";
import { Identity, SerializableIdentity } from "../../api/identity/Identity";
import { RootState } from "../../app/rootReducer";
import { IdentitySelector } from "./IdentitySelector";
import { selectIdentity } from "./IdentitySlice";
import CreateIdentityButton from "./CreateIdentityButton";

const useStyles = makeStyles((theme) => ({
  buttonLink: {
    display: "inline-block",
    padding: theme.spacing(1),
  },
  menuButtonLink: {
    color: theme.palette.primary.main,
  },
}));

type SingleIdentityViewProps = {
  selectedIdentity: Identity;
};
const SingleIdentityView: FC<SingleIdentityViewProps> = ({
  selectedIdentity,
}: SingleIdentityViewProps) => {
  const text = abbreviateAddress(selectedIdentity.address.toBase58(), 6);
  return <ListItemText primary={text} />;
};

const ViewSelector: FC = () => {
  const {
    identity: { identities, selectedIdentity },
    global: { loading },
    wallet: { connected },
  } = useSelector((state: RootState) => state);
  const dispatch = useDispatch();
  const select = (identity: SerializableIdentity) =>
    dispatch(selectIdentity(identity));

  return !connected || !!loading ? (
    <Typography>
      <FormattedMessage id="identity.none" />
    </Typography>
  ) : !identities || identities.length < 1 || !selectedIdentity ? (
    <CreateIdentityButton loading={!!loading} />
  ) : identities.length === 1 ? (
    <SingleIdentityView selectedIdentity={Identity.from(selectedIdentity)} />
  ) : (
    <IdentitySelector
      select={select}
      current={selectedIdentity}
      available={identities}
    />
  );
};

const IdentitySectionView: FC = () => {
  const classes = useStyles();

  return (
    <List>
      <Link
        key="identity.edit"
        component={RouterLink}
        to={{ pathname: "identity" }}
      >
        <ListItem button key="identity">
          <ListItemIcon className={classes.menuButtonLink}>
            <IdentityIcon />
          </ListItemIcon>
          <ViewSelector />
        </ListItem>
      </Link>
    </List>
  );
};

export default IdentitySectionView;
