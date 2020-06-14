import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";
import TextField from "@material-ui/core/TextField";
import sharedStylesFn from "../style/sharedStyles";

const useStyles = makeStyles(theme => ({
  ...sharedStylesFn(theme)
}));

const SendSmsDialog = ({ message }) => {
  const { t: str } = useTranslation();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  const classes = useStyles();

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="-dialog-title">
      <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
      <DialogContent>
        <DialogContentText>{message.toString()}</DialogContentText>
        <TextField
          className={classes.field}
          autoFocus
          margin="dense"
          id="name"
          label={str("webapp:zoneFinder.sendSms.inputLabel")}
          type="string"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          {str("webapp:zoneFinder.sendSms.cancelButtonText")}
        </Button>
        <Button onClick={handleClose} color="primary">
          {str("webapp:zoneFinder.sendSms.sendSmsButtonText")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendSmsDialog;
