import { AnyAction } from "@reduxjs/toolkit";
import { Action } from "typesafe-actions";

interface RejectedAction extends Action {
  error: Error;
}

export const isRejectedAction = (action: AnyAction): action is RejectedAction =>
  action.type.endsWith("rejected");

export const isFulfilledAction = <T extends AnyAction>(action: T): T =>
  action.type.endsWith("fulfilled");

export const isPendingAction = (action: AnyAction): action is AnyAction =>
  action.type.endsWith("pending");
