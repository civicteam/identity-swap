import { OptionsObject, SnackbarKey } from "notistack";
import { Optional } from "utility-types";

/**
 * A type interface for any state that is loaded from some backend or async source.
 */
export interface Loadable {
  loading: boolean;
  error: string | null;
}

/**
 * A notification type used by notistack
 */
export interface Notification {
  key: SnackbarKey;
  message: string;
  options: OptionsObject;
  dismissed: boolean;
}

/**
 * A type used when creating a notification
 */
export type SparseNotification = Optional<
  Notification,
  "key" | "options" | "dismissed"
>;
