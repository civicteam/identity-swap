import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import { useIntl } from "react-intl";
import { makeStyles } from "@material-ui/core/styles";
import IdentityIcon from "@material-ui/icons/PermIdentity";
import { SerializableIdentity } from "../../api/identity/Identity";
import { RootState } from "../../app/rootReducer";
import { IdentitySelector } from "./IdentitySelector";
import { selectIdentity } from "./IdentitySlice";

const useStyles = makeStyles((theme) => ({
  buttonLink: {
    display: "inline-block",
    padding: theme.spacing(1),
  },
  menuButtonLink: {
    color: theme.palette.primary.main,
  },
}));

const ViewSelector: FC = () => {
  const {
    identity: { identities, selectedIdentity, identitiesLoaded },
  } = useSelector((state: RootState) => state);
  const dispatch = useDispatch();
  const intl = useIntl();
  const select = (identity: SerializableIdentity) =>
    dispatch(selectIdentity(identity));

  return !identities || !identitiesLoaded ? (
    <></>
  ) : identities.length < 1 || !selectedIdentity ? (
    <ListItemText
      primary={intl.formatMessage({ id: "identity.create.menu" })}
    />
  ) : identities.length === 1 ? (
    <ListItemText primary={intl.formatMessage({ id: "menu.identity" })} />
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
