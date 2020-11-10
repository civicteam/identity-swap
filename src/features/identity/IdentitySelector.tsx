import React, { FC } from "react";
import NativeSelect from "@material-ui/core/NativeSelect";
import { useIntl } from "react-intl";
import { indexOf } from "ramda";
import { SerializableIdentity } from "../../api/identity/Identity";

enum TestIds {
  IDENTITY_OPTION = "IDENTITY_OPTION",
  IDENTITY_SELECTOR = "IDENTITY_SELECTOR",
}

type Props = {
  select: (selected: SerializableIdentity) => void;
  current?: SerializableIdentity;
  available: Array<SerializableIdentity>;
};
export const IdentitySelector: FC<Props> = ({
  select,
  current,
  available,
}: Props) => {
  const intl = useIntl();
  return (
    <NativeSelect
      data-testid={TestIds.IDENTITY_SELECTOR}
      aria-label={intl.formatMessage({ id: "identity.selector" })}
      value={indexOf(current, available)}
      onChange={(event) => select(available[Number(event.target.value)])}
    >
      {available.map((identity, index) => (
        <option
          data-testid={`${TestIds.IDENTITY_OPTION}_${index}`}
          key={identity.address}
          value={index}
        >
          {identity.address}
        </option>
      ))}
    </NativeSelect>
  );
};
