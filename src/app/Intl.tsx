import React, { FC, ReactNode } from "react";
import { IntlProvider } from "react-intl";

import { head, isNil, map, mergeRight, tail } from "ramda";
import { DevWindow } from "../types/global";

import en from "../lang/en.json";
import de from "../lang/de.json";
import ar from "../lang/ar.json";
import el from "../lang/el.json";
import es from "../lang/es.json";
import it from "../lang/it.json";
import zh from "../lang/zh.json";

declare let window: DevWindow;
type Messages = Record<string, string>;
type LocaleInformation = {
  locale: string;
  messages: Messages;
};

const DEFAULT_LANGUAGE = "en";
const locales = [
  window.userLanguage, // used in tests only, to override the language
  ...(navigator.languages || [navigator.language]),
  "en-US",
].filter((language) => !isNil(language));

/**
 * Set the default language values as the defaults for any missing locale strings.
 * This has the disadvantage of losing console warning for missing strings
 * but avoids the issue where ids are used as fallbacks, without having to pass
 * defaultMessages into every intl.formatMessage call and FormattedMessage tag.
 * See https://github.com/formatjs/formatjs/issues/557 for more details
 * @param defaults
 * @param messageMap
 */
const mergeDefaults = (
  defaults: Messages,
  messageMap: Record<string, Messages>
): Record<string, Messages> => map(mergeRight(defaults), messageMap);

// the map of supported locales to their language files
const messages: Record<string, Messages> = mergeDefaults(en, {
  en,
  de,
  ar,
  el,
  es,
  it,
  zh,
});

/**
 * Given a set of locales, find the messages for the preferred one
 * @param localeList
 */
const findMessages = (localeList: Array<string>): LocaleInformation => {
  // find the preferred language from the ordered locale string
  const locale = head(localeList); // e.g. "en-US"

  // no locales found - return the hard-coded default locale
  if (!locale)
    return { locale: DEFAULT_LANGUAGE, messages: messages[DEFAULT_LANGUAGE] };

  const language = locale.split("-")[0]; // eg "en"
  const foundMessages = messages[locale] || messages[language];

  if (foundMessages) return { locale, messages: foundMessages };

  // look at the next entry in the list
  return findMessages(tail(localeList));
};

const localeInformation = findMessages(locales);

type Props = {
  children: ReactNode;
};
const Intl: FC<Props> = ({ children }: Props) => (
  <IntlProvider {...localeInformation} defaultLocale={DEFAULT_LANGUAGE}>
    {children}
  </IntlProvider>
);

export default Intl;
