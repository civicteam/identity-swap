import { Slide, toast, ToastContainer, TypeOptions } from "react-toastify";
import React, { FC } from "react";
import { FormattedMessage } from "react-intl";
import { createStyles, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ViewTxOnExplorer } from "./ViewTxOnExplorer";

// these map to toastify.TypeOptions. If we want to use a different service, with different
// type names, we should write a mapping function here, rather than changing this type.
type NotificationType = "error" | "warn" | "info";

type NotificationOptions = {
  actionComponent: JSX.Element;
  type: NotificationType;
};

const useStyles = makeStyles((theme) =>
  createStyles({
    // styles for the various toaster types go here.
    // Default background is red for errors, theme.secondary for warnings,
    // theme.primray for info.
    toastContainer: {
      "& .error": {},
      "& .warn": {
        backgroundColor: theme.palette.secondary.main,
      },
      "& .info": {
        backgroundColor: theme.palette.primary.main,
      },
    },
    // If actions are links, make them white to avoid clashing with the theme
    action: {
      "text-align": "right",
      "& a": {
        color: theme.palette.common.white,
      },
    },
    message: {
      "padding-left": theme.spacing(2),
    },
  })
);
/**
 * Container for the notifier. Add this anywhere on the DOM
 */
export const Notifier: FC = () => {
  const classes = useStyles();
  return (
    <ToastContainer
      className={classes.toastContainer}
      transition={Slide}
      position="bottom-left"
      hideProgressBar
      rtl={false}
    />
  );
};

type NotificationProps = {
  message: string;
} & Partial<NotificationOptions>;
/**
 * Component to be embedded into the toaster
 * @param message
 * @param actionComponent
 * @constructor
 */
const NotificationComponent: FC<NotificationProps> = ({
  message,
  actionComponent,
}: NotificationProps) => {
  const classes = useStyles();
  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs className={classes.message}>
          <FormattedMessage id={message} />
        </Grid>
        {actionComponent && (
          <Grid item xs className={classes.action}>
            {actionComponent}
          </Grid>
        )}
      </Grid>
    </div>
  );
};

/**
 * Call this function from anywhere in the code to emit a toaster.
 * It will default to "error" type if no type is provided
 * @param message
 * @param options
 */
export const notify = (
  message: string,
  options: Partial<NotificationOptions> = {}
): void => {
  const typeString = options.type || "error";
  const type = typeString as TypeOptions;
  const component = <NotificationComponent message={message} {...options} />;

  toast(component, { type, className: type });
};

export const notifyTransaction = (transactionSignature: string): void =>
  notify("notification.info.transactionSent", {
    type: "info",
    actionComponent: <ViewTxOnExplorer txSignature={transactionSignature} />,
  });
