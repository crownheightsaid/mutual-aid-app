import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import SendRoundedIcon from "@material-ui/icons/SendRounded";
import { useIntl } from "react-intl";
import { FormattedMessage } from "react-intl.macro";
import React, { useCallback, useContext, useState, memo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import messages from "../i18n/Messages";
import JustTextContent from "./JustTextContext";
import { FirebaseContext } from "../utils/Firebase";
import { useNavigateIntl } from "./IntlRouter";

const FORM_X_MARGIN_SCALE = 1;
// `select` fields and the like
export const DEFAULT_FORM_STATE = {
  payment: "pay-store-ahead"
};

const useStyles = makeStyles(theme => ({
  form: {
    marginLeft: theme.spacing(FORM_X_MARGIN_SCALE),
    marginRight: theme.spacing(FORM_X_MARGIN_SCALE),
    display: "flex",
    flexWrap: "wrap"
  },
  button: {
    marginLeft: theme.spacing(FORM_X_MARGIN_SCALE),
    marginTop: "inherit",
    marginBottom: "inherit",
    width: "30%"
  },
  fieldHalfWidth: {
    marginLeft: theme.spacing(FORM_X_MARGIN_SCALE),
    marginRight: theme.spacing(FORM_X_MARGIN_SCALE),
    width: `calc(50% - (2 * ${theme.spacing(FORM_X_MARGIN_SCALE)}px))`
  },
  fieldFullWidth: {
    marginLeft: theme.spacing(FORM_X_MARGIN_SCALE),
    marginRight: theme.spacing(FORM_X_MARGIN_SCALE),
    width: `calc(100% - (2 * ${theme.spacing(FORM_X_MARGIN_SCALE)}px))`
  }
}));

const MemoedTextField = memo(TextField);

export default function RequestForm({ className }) {
  const classes = useStyles();
  const intl = useIntl();
  const navigateIntl = useNavigateIntl();
  const app = useContext(FirebaseContext);
  const [{ loading, error }, setFormState] = useState({
    loading: false,
    error: false
  });
  const [formValues, setFormValues] = useState(DEFAULT_FORM_STATE);
  const onChange = useCallback(event => {
    const { name, value } = event.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  }, []);

  if (error) {
    return (
      <JustTextContent body="Error while submitting request. Refresh to try again." />
    );
  }

  const handleSubmit = event => {
    event.preventDefault();
    setFormState(prev => ({ ...prev, loading: true }));
    app
      .firestore()
      .collection("requests")
      .add({ ...formValues, assigned: "" })
      .then(() => {
        navigateIntl("/request-success");
      })
      .catch(e => {
        setFormState({ loading: false, error: e });
      });
  };

  return (
    <form
      className={`${className} ${classes.form}`}
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <MemoedTextField
        label={intl.formatMessage(messages["app.request.form.firstname"])}
        id="firstname"
        name="firstname"
        value={formValues.firstname || ""}
        autoComplete="given-name"
        type="text"
        variant="outlined"
        required
        margin="normal"
        onChange={onChange}
        className={classes.fieldHalfWidth}
      />
      <MemoedTextField
        label={intl.formatMessage(messages["app.request.form.lastname"])}
        id="lastname"
        name="lastname"
        autoComplete="family-name"
        type="text"
        variant="outlined"
        required
        margin="normal"
        onChange={onChange}
        className={classes.fieldHalfWidth}
      />
      <MemoedTextField
        label={intl.formatMessage(messages["app.request.form.phone"])}
        id="phone"
        name="phone"
        autoComplete="tel"
        type="tel"
        required
        variant="outlined"
        margin="normal"
        onChange={onChange}
        className={classes.fieldFullWidth}
      />
      <MemoedTextField
        label={intl.formatMessage(messages["app.request.form.email"])}
        id="email"
        name="email"
        autoComplete="email"
        type="email"
        margin="normal"
        variant="outlined"
        onChange={onChange}
        className={classes.fieldFullWidth}
      />
      <MemoedTextField
        label={intl.formatMessage(messages["app.request.form.address"])}
        helperText={intl.formatMessage(
          messages["app.request.form.address.help"]
        )}
        id="address"
        name="address"
        margin="normal"
        autoComplete="street-address"
        type="text"
        variant="outlined"
        required
        onChange={onChange}
        className={classes.fieldFullWidth}
      />
      <MemoedTextField
        label={intl.formatMessage(messages["app.request.form.postal"])}
        id="postal"
        name="postal"
        margin="normal"
        autoComplete="postal-code"
        type="text"
        variant="outlined"
        required
        onChange={onChange}
        className={classes.fieldFullWidth}
      />
      <MemoedTextField
        label={intl.formatMessage(messages["app.request.form.neighborhood"])}
        id="neighborhood"
        name="neighborhood"
        placeholder={intl.formatMessage(
          messages["app.request.form.neighborhood.placeholder"]
        )}
        margin="normal"
        variant="outlined"
        required
        onChange={onChange}
        className={classes.fieldFullWidth}
      />
      {/* TODO persist this in localstorage  */}
      <MemoedTextField
        label={intl.formatMessage(messages["app.request.form.items"])}
        helperText={intl.formatMessage(messages["app.request.form.items.help"])}
        id="grocery-list"
        name="grocery-list"
        rowsMax="10"
        rows="5"
        multiline
        variant="outlined"
        margin="normal"
        required
        onChange={onChange}
        className={classes.fieldFullWidth}
      />
      <MemoedTextField
        label={intl.formatMessage(messages["app.request.form.store"])}
        helperText={intl.formatMessage(messages["app.request.form.store.help"])}
        id="store"
        name="store"
        margin="normal"
        variant="outlined"
        required
        onChange={onChange}
        className={classes.fieldFullWidth}
      />
      <MemoedTextField
        label={intl.formatMessage(messages["app.request.form.payment"])}
        helperText={intl.formatMessage(
          messages["app.request.form.payment.help"]
        )}
        id="payment"
        name="payment"
        select
        SelectProps={{
          native: true
        }}
        margin="normal"
        variant="outlined"
        required
        onChange={onChange}
        className={classes.fieldFullWidth}
      >
        <option value="pay-store-ahead">
          {intl.formatMessage(messages["app.request.form.payment.ahead"])}
        </option>
        <option value="pay-volunteer-before">
          {intl.formatMessage(messages["app.request.form.payment.before"])}
        </option>
        <option value="pay-volunteer-after">
          {intl.formatMessage(messages["app.request.form.payment.after"])}
        </option>
      </MemoedTextField>
      <MemoedTextField
        label={intl.formatMessage(messages["app.request.form.notes"])}
        id="notes"
        name="notes"
        margin="normal"
        rowsMax="5"
        variant="outlined"
        multiline
        onChange={onChange}
        className={classes.fieldFullWidth}
      />
      <MemoedTextField
        label={intl.formatMessage(messages["app.request.form.subsidy"])}
        helperText={intl.formatMessage(
          messages["app.request.form.subsidy.help"]
        )}
        id="subsidy"
        name="subsidy"
        placeholder={intl.formatMessage(
          messages["app.request.form.subsidy.placeholder"]
        )}
        variant="outlined"
        margin="normal"
        onChange={onChange}
        className={classes.fieldFullWidth}
      />
      <Button
        variant="outlined"
        startIcon={<SendRoundedIcon />}
        className={classes.button}
        type="submit"
      >
        <FormattedMessage id="app.form.submit" defaultMessage="Submit" />
      </Button>
      {loading && <CircularProgress className={classes.button} />}
    </form>
  );
}
