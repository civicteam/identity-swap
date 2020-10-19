import React, { FC, ReactElement, useEffect, useState } from "react";
import UpArrow from "@material-ui/icons/ArrowUpward";
import DownArrow from "@material-ui/icons/ArrowDownward";
import { makeStyles } from "@material-ui/core/styles";
import { Fade } from "@material-ui/core";
import { isNil } from "ramda";
import { Pool } from "../../api/pool/Pool";

// A change will no longer be considered new after 5s
const DEFAULT_IS_NEW_TIMEOUT_MS = 5000;

export enum TestIds {
  RATE_DOWN = "RATE_DOWN",
  RATE_UP = "RATE_UP",
}

const useStyles = makeStyles((theme) => ({
  default: {
    width: "20px",
  },
  lessThan: {
    color: theme.palette.secondary.main,
    "font-size": "1rem",
    "vertical-align": "middle",
  },
  greaterThan: {
    color: theme.palette.primary.main,
    "font-size": "1rem",
    "vertical-align": "middle",
  },
}));

type ConditionalFadeProps = {
  condition: boolean;
  children: ReactElement;
};
const ConditionalFade: FC<ConditionalFadeProps> = ({
  condition,
  children,
}: ConditionalFadeProps) => (
  <Fade in={condition} unmountOnExit={true}>
    {children}
  </Fade>
);

type Props = { pool: Pool; isNewTimeoutMs?: number };
export const SimpleRateChangeIndicator: FC<Props> = ({
  pool,
  isNewTimeoutMs = DEFAULT_IS_NEW_TIMEOUT_MS,
}: Props) => {
  const classes = useStyles();
  const currentValue = pool.simpleRate().toNumber();
  const previousValue = pool.getPrevious()?.simpleRate().toNumber();

  const [isNew, setNew] = useState(true);

  useEffect(() => {
    setNew(true);
    setTimeout(() => setNew(false), isNewTimeoutMs);
  }, [currentValue, isNewTimeoutMs]);

  return (
    <>
      {!isNew ||
        isNil(previousValue) ||
        (previousValue === currentValue && (
          <span className={classes.default} />
        ))}
      <ConditionalFade
        condition={isNew && !!previousValue && currentValue > previousValue}
      >
        <UpArrow
          className={classes.greaterThan}
          data-testid={TestIds.RATE_UP}
        />
      </ConditionalFade>
      <ConditionalFade
        condition={isNew && !!previousValue && currentValue < previousValue}
      >
        <DownArrow
          className={classes.lessThan}
          data-testid={TestIds.RATE_DOWN}
        />
      </ConditionalFade>
    </>
  );
};
