import { SnackbarKey } from "notistack";
import { propEq, reject } from "ramda";
import { Notification } from "../../utils/types";

export const rejectByKey = (
  key: SnackbarKey,
  notifications: Notification[]
): Notification[] => reject(propEq("key", key), notifications);
