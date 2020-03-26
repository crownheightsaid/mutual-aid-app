import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import LanguageIcon from "@material-ui/icons/Translate";
import { useIntl } from "react-intl";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";
import { FormattedMessage } from "react-intl.macro";
import { SUPPORTED_LANGS } from "../i18n/locales";

const useStyles = makeStyles(theme => ({
  menuButton: {
    marginRight: theme.spacing(2)
  },
  language: {
    [theme.breakpoints.up("md")]: {
      display: "inline-flex"
    },
    display: "none",
    margin: theme.spacing(0, 0.5, 0, 1)
  }
}));

export default function LanguagePicker({ location }) {
  const classes = useStyles();
  const intl = useIntl();
  const [languageMenu, setLanguageMenu] = React.useState(null);
  const handleLanguageIconClick = event => {
    setLanguageMenu(event.currentTarget);
  };
  const handleLanguageMenuClose = () => {
    setLanguageMenu(null);
  };

  return (
    <>
      <Button color="inherit" onClick={handleLanguageIconClick}>
        <LanguageIcon />
        <span className={classes.language}>{SUPPORTED_LANGS[intl.locale]}</span>
        <ExpandMoreIcon fontSize="small" />
      </Button>

      <Menu
        id="language-menu"
        anchorEl={languageMenu}
        open={Boolean(languageMenu)}
        onClose={handleLanguageMenuClose}
      >
        {Object.keys(SUPPORTED_LANGS).map(code => (
          <MenuItem
            component="a"
            data-no-link="true"
            href={`/${code}`}
            key={code}
            selected={intl.locale === code}
            onClick={handleLanguageMenuClose}
            lang={code}
            hrefLang={code}
          >
            {SUPPORTED_LANGS[code]}
          </MenuItem>
        ))}
        <Box my={1}>
          <Divider />
        </Box>
        <MenuItem
          component="a"
          data-no-link="true"
          href="https://github.com/mjmaurer/share-a-local-meal/tree/master/src/i18n"
          rel="noopener nofollow"
          target="_blank"
          hrefLang="en"
          onClick={handleLanguageMenuClose}
        >
          <FormattedMessage
            id="app.nav.lang.help"
            defaultMessage="Help to translate"
          />
        </MenuItem>
      </Menu>
    </>
  );
}
