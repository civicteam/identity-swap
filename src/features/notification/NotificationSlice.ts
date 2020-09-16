import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SnackbarKey } from "notistack";
import { v4 as uuid } from "uuid";

import { Notification, SparseNotification } from "../../utils/types";
import { rejectByKey } from "./util";

export interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: [],
};

// fill in any missing notification fields
const toNotification = (
  sparseNotification: SparseNotification
): Notification => ({
  key: uuid() as SnackbarKey,
  options: {},
  dismissed: false,
  ...sparseNotification,
});

const actionToNotification = (
  action: PayloadAction<SparseNotification>
): Notification => toNotification(action.payload);

export const NOTIFICATION_SLICE_NAME = "notification";
const notificationSlice = createSlice({
  name: NOTIFICATION_SLICE_NAME,
  initialState,
  reducers: {
    add: (state, action: PayloadAction<SparseNotification>) => ({
      ...state,
      notifications: [...state.notifications, actionToNotification(action)],
    }),
    remove: (state, action: PayloadAction<SnackbarKey>) => ({
      ...state,
      notifications: rejectByKey(action.payload, state.notifications),
    }),
  },
});

export const {
  add: addNotification,
  remove: removeNotification,
} = notificationSlice.actions;
export default notificationSlice.reducer;
