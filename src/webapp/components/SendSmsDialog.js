import React, { useEffect, useState } from "react";
import useAxios from "axios-hooks";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { CircularProgress } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";
import TextField from "@material-ui/core/TextField";
import sharedStylesFn from "../style/sharedStyles";

const useStyles = makeStyles(theme => ({
  ...sharedStylesFn(theme),
  messageTextarea: {
    width: "100%"
  }
}));

const SendSmsDialog = ({ message, isOpen, onClose }) => {
  const { t: str } = useTranslation();
  const [smsMessage, setSmsMessage] = useState(message);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [invalidPhoneNumber, setInvalidPhoneNumber] = useState(false);

  const classes = useStyles();

  const [{ data, loading, error }, submit] = useAxios(
    {
      url: `/api/send-sms`,
      method: "post"
    },
    { manual: true } // Don't send on render
  );

  useEffect(() => {
    if (data && data.success && phoneNumber) {
      onClose();
      setPhoneNumber("");
    }
  }, [data, onClose, phoneNumber]);

  const validatePhoneNumber = number => {
    const phoneNumberRegEx = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (number.match(phoneNumberRegEx)) {
      setInvalidPhoneNumber(false);
      return true;
    }
    setInvalidPhoneNumber(true);
    return false;
  };

  const handleSubmit = event => {
    event.preventDefault();
    if (validatePhoneNumber(phoneNumber)) {
      submit({
        data: {
          smsMessage,
          phoneNumber
        }
      });
    }
  };

  return (
    <Dialog
      fullWidth
      open={isOpen}
      onClose={onClose}
      aria-labelledby="sms-dialog"
    >
      <DialogTitle id="sms-dialog-title">Send SMS</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {str("webapp:sendSms.messageInfo")}
          <TextareaAutosize
            className={classes.messageTextarea}
            onChange={e => setSmsMessage(e.target.value)}
            aria-label="sms-textarea"
            defaultValue={message}
          />
        </DialogContentText>
        <TextField
          className={classes.field}
          autoFocus
          margin="dense"
          error={Boolean(invalidPhoneNumber)}
          helperText={
            invalidPhoneNumber && str("webapp:sendSms.invalidPhoneMessage")
          }
          id="sms-dialog-message"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          label={str("webapp:sendSms.inputLabel")}
          type="string"
          fullWidth
        />
        {error && (
          <>
            <Typography className={classes.text} variant="body1">
              {str("webapp:sendSms.apiErrorMessage")}
              &nbsp;
              <a href={str("webapp:slack.techChannelUrl")}>
                {str("webapp:slack.techChannel")}
              </a>
            </Typography>
          </>
        )}
        {loading && <CircularProgress />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {str("webapp:sendSms.cancelButtonText")}
        </Button>
        <Button onClick={handleSubmit} color="primary">
          {str("webapp:sendSms.sendSmsButtonText")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendSmsDialog;
