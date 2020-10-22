import React, { ChangeEvent, FC, useCallback, useState } from "react";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Popover from "@material-ui/core/Popover";
import PopupState, { bindTrigger, bindPopover } from "material-ui-popup-state";
import HelpIcon from "@material-ui/icons/Help";
import { Divider, IconButton } from "@material-ui/core";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputAdornment from "@material-ui/core/InputAdornment";
import { useDispatch, useSelector } from "react-redux";
import { isEmpty } from "ramda";
import { useIntl } from "react-intl";
import { tokenPairSelector } from "../../utils/tokenPair";
import { updateTokenPairState } from "../../features/TokenPairSlice";
import { IntlNumberParser } from "../../utils/IntlNumberParser";

export const SlippageSelector: FC = () => {
  const dispatch = useDispatch();
  const { slippage } = useSelector(tokenPairSelector);
  const intl = useIntl();
  const intlNumberParser = new IntlNumberParser(intl.locale);

  const parseNumber = useCallback(
    (numberString: string) => intlNumberParser.parse(numberString),
    [intlNumberParser]
  );

  const [value, setValue] = useState("" + slippage);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const valueString = event.target.value;
    const parsedNumber = parseNumber(valueString);
    if (!isNaN(parsedNumber) || isEmpty(valueString)) {
      setValue(valueString);
      dispatch(
        updateTokenPairState({
          slippage: isEmpty(valueString) ? 0 : parsedNumber,
        })
      );
    }
  };

  return (
    <PopupState variant="popover" popupId="demo-popup-popover">
      {(popupState) => (
        <div>
          <IconButton size="small" {...bindTrigger(popupState)}>
            <HelpIcon fontSize="inherit" />
          </IconButton>
          <Popover
            {...bindPopover(popupState)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Box p={2}>
              <Typography>Slippage Tolerance</Typography>
              <Divider />
              <OutlinedInput
                id="outlined-adornment-weight"
                value={value || ""}
                onChange={handleChange}
                endAdornment={<InputAdornment position="end">%</InputAdornment>}
                aria-describedby="outlined-weight-helper-text"
                inputProps={{
                  "aria-label": "tolerance",
                }}
                labelWidth={0}
              />
            </Box>
          </Popover>
        </div>
      )}
    </PopupState>
  );
};
