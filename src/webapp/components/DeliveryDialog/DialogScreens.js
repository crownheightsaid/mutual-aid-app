import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import MuiPhoneNumber from "material-ui-phone-number";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import sharedStylesFn from "webapp/style/sharedStyles";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import Instructions from "./Instructions";

const useStyles = makeStyles((theme) => ({
  ...sharedStylesFn(theme),
  infoActionsContainer: {
    justifyContent: "space-around",
  },
  errorMsg: {
    color: theme.status.danger,
  },
  instructionsActionsContainer: {
    justifyContent: "flex-start",
  },
  backButton: {
    backgroundColor: "lightgray",
  },
  formContent: {
    "& > *": {
      marginBottom: theme.spacing(2),
    },
  },
  centeredContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

export const InfoStep = ({ handleAccept, handleGetMoreInfo, requestCode }) => {
  const classes = useStyles();
  const { t: str } = useTranslation();

  return (
    <>
      <DialogTitle>
        {str("webapp:deliveryNeeded.dialog.title", {
          defaultValue: "How to make a delivery",
        })}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          {"\nLorem ipsum stuff\n"}
          {requestCode}
          {"\nIf you agree, please provide your phone number etc"}
        </Typography>
      </DialogContent>
      <DialogActions className={classes.infoActionsContainer}>
        <a href="#todo" onClick={handleGetMoreInfo}>
          <Typography variant="body2">
            {str("webapp:deliveryNeeded.dialog", {
              defaultValue: "No, I need more information.",
            })}
          </Typography>
        </a>
        <Button color="primary" variant="contained" onClick={handleAccept}>
          <Typography variant="button">
            {str("webapp:deliveryNeeded.dialog", {
              defaultValue: "Yes, I accept.",
            })}
          </Typography>
        </Button>
      </DialogActions>
    </>
  );
};

export const InstructionsStep = ({ handleGoBack }) => {
  const classes = useStyles();
  const { t: str } = useTranslation();

  return (
    <>
      <DialogTitle>
        {str("webapp:deliveryNeeded.dialog.title", {
          defaultValue: "How to make a delivery",
        })}
      </DialogTitle>
      <DialogContent>
        <Instructions />
      </DialogContent>
      <DialogActions className={classes.instructionsActionsContainer}>
        <Button onClick={handleGoBack} className={classes.backButton}>
          {str("webapp:deliveryNeeded.dialog.backButton", {
            defaultValue: "Back",
          })}
        </Button>
      </DialogActions>
    </>
  );
};

export const FormStep = ({ phoneNumber, setPhoneNumber, onSubmit }) => {
  const classes = useStyles();
  const { t: str } = useTranslation();
  const [error, setError] = useState();
  const isEmptyPhoneNumber =
    !phoneNumber || !`${phoneNumber}`.length || `${phoneNumber}`.length < 17;

  const handleSubmit = () => {
    // validate phonenumber
    if (isEmptyPhoneNumber) {
      setError("Phone number is required.");
    } else {
      onSubmit();
    }
  };

  return (
    <>
      <DialogTitle>
        {str("webapp:deliveryNeeded.dialog.title", {
          defaultValue: "Contact information",
        })}
      </DialogTitle>
      <DialogContent
        className={`${classes.centeredContent} ${classes.formContent}`}
      >
        <Typography variant="body2">
          {str("webapp:deliveryNeeded.dialog.form", {
            defaultValue:
              "Please provide your phone number so we can text you stuff.",
          })}
        </Typography>
        <MuiPhoneNumber
          required
          defaultCountry="us"
          onChange={(value) => setPhoneNumber(value)}
        />
        {error && (
          <p className={classes.errorMsg}>
            <Typography variant="caption">
              {str("webapp:deliveryNeeded.dialog.form", {
                defaultValue: error,
              })}
            </Typography>
          </p>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          variant="contained"
          onClick={handleSubmit}
          disabled={isEmptyPhoneNumber}
        >
          <Typography variant="body2">
            {str("webapp:deliveryNeeded.dialog.submit", {
              defaultValue: "Submit",
            })}
          </Typography>
        </Button>
      </DialogActions>
    </>
  );
};

export const FinishStep = () => {
  const classes = useStyles();
  const { t: str } = useTranslation();

  return (
    <>
      <DialogTitle>
        {str("webapp:deliveryNeeded.dialog.finish", {
          defaultValue: "Thank you!",
        })}
      </DialogTitle>
      <DialogContent className={classes.centeredContent}>
        <CheckCircleIcon fontSize="large" color="primary" />
      </DialogContent>
    </>
  );
};
