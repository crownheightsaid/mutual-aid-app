import React from "react";
import Link from "@material-ui/core/Link";

import { Router, Redirect, Link as RouterLink } from "@reach/router";

// const polyfillIntl = language => {
//   const locale = language.split("-")[0];
//   try {
//     if (!Intl.PluralRules) {
//       require("@formatjs/intl-pluralrules/polyfill");
//       require(`@formatjs/intl-pluralrules/dist/locale-data/${locale}`);
//     }

//     if (!Intl.RelativeTimeFormat) {
//       require("@formatjs/intl-relativetimeformat/polyfill");
//       require(`@formatjs/intl-relativetimeformat/dist/locale-data/${locale}`);
//     }
//   } catch (e) {
//     throw new Error(`Cannot find react-intl/locale-data/${language}`);
//   }
// };

const LangRoute = ({ lang, children, location }) => {
  // const supportedLang = "en";
  React.useEffect(() => window.scrollTo(0, 0), [location.pathname]);
  // polyfillIntl(supportedLang);
  // return (
  //   <IntlProvider
  //     locale={supportedLang}
  //     defaultLocale="en"
  //     messages={translations[supportedLang]}
  //   >
  //     {children}
  //   </IntlProvider>
  // );
  return <>{children}</>;
};

export default function IntlRouter({ children }) {
  return (
    <Router>
      <Redirect from="/" to="/en" />
      <LangRoute path=":lang">{children}</LangRoute>
    </Router>
  );
}

export const IntlLink = ({ to, children, className }) => {
  return (
    <Link className={className} component={RouterLink} to={`/en${to}`}>
      {children}
    </Link>
  );
};

// export const useNavigateIntl = () => {
//   const intl = useIntl();
//   return pathFromIntl => navigate(`/${intl.locale}${pathFromIntl}`);
// };
