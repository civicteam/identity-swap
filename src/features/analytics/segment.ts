import { createMiddleware } from "redux-beacon";
import Segment, { identifyUser, trackEvent } from "@redux-beacon/segment";

const segment = Segment();

const eventsMap = {
  "wallet/connect/fulfilled": identifyUser((action) => ({
    // For analytics purposes, we define the user by their wallet public key
    userId: action.payload,
  })),
  "*": trackEvent((action) => ({
    name: action.type,
    properties: action.payload,
  })),
};

export const segmentMiddleware = createMiddleware(eventsMap, segment);
