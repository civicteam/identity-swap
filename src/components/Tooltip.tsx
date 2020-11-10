import React, { FC } from "react";
import { IconButton, Tooltip } from "@material-ui/core";
import HelpIcon from "@material-ui/icons/Help";
import { useIntl } from "react-intl";

type Props = { text: string };
const TooltipIcon: FC<Props> = ({ text }: Props) => {
  const intl = useIntl();
  const formattedText = intl.formatMessage({ id: text });

  return (
    <Tooltip title={formattedText}>
      <IconButton>
        <HelpIcon fontSize={"small"} />
      </IconButton>
    </Tooltip>
  );
};
export default TooltipIcon;
