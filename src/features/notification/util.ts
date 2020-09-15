import { SnackbarKey } from "notistack";
import { Notification } from "../../utils/types";
import { propEq, reject } from "ramda";

export const rejectByKey = (
  key: SnackbarKey,
  notifications: Notification[]
): Notification[] => reject(propEq("key", key), notifications);
