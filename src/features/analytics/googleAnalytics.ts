import GoogleAnalyticsGtag, {
  trackEvent,
} from "@redux-beacon/google-analytics-gtag";
import { createMiddleware } from "redux-beacon";
import { GA_TRACKING_ID } from "../../utils/env";

const ga = GoogleAnalyticsGtag(GA_TRACKING_ID as string);

const eventsMap = {
  "*": trackEvent((action) => ({
    category: "redux",
    action: action.type,
    value: action.payload,
  })),
};

export const gaMiddleware = createMiddleware(eventsMap, ga);
