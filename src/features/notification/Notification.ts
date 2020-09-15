import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SnackbarKey, useSnackbar } from "notistack";
import { includes } from "ramda";
import { Notification } from "../../utils/types";
import { removeNotification, NotificationState } from "./NotificationSlice";
import { RootState } from "../../app/rootReducer";

const Notifier = (): JSX.Element | null => {
  const [displayed, setDisplayed] = useState<SnackbarKey[]>([]);
  const dispatch = useDispatch();
  const notifications = useSelector((store: RootState) => {
    const notificationState: NotificationState = store.notification;
    return notificationState.notifications || [];
  });
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  React.useEffect(() => {
    const storeDisplayed = (id: SnackbarKey) => {
      setDisplayed([...displayed, id]);
    };

    notifications.forEach(
      ({ key, message, options = {}, dismissed }: Notification) => {
        if (dismissed) {
          // dismiss snackbar using notistack
          closeSnackbar(key);
          return;
        }

        if (includes(key, displayed)) return;

        // display snackbar using notistack
        console.log("displayed", displayed);
        console.log("displaying key", key);
        enqueueSnackbar(message, {
          key,
          ...options,
          onClose: (event, reason, myKey) => {
            if (options.onClose) {
              options.onClose(event, reason, myKey);
            }
          },
          onExited: (event, myKey) => {
            // remove this snackbar from redux store
            dispatch(removeNotification(myKey));
          },
        });

        // keep track of snackbars that we've displayed
        storeDisplayed(key);
      }
    );
  });

  return null;
};

export default Notifier;
