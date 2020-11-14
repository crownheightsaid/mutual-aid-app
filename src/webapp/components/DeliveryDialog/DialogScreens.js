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
import Box from "@material-ui/core/Box";
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
  centeredContent: {
    "& > *": {
      marginBottom: theme.spacing(2),
    },
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
          defaultValue: "Do you agree to complete this delivery?",
        })}
      </DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography variant="body2">
            {str("webapp:deliveryNeeded.dialog.condition", {
              defaultValue: `If you agree, we will ask for your phone number so we can text you the
            details for the delivery You should aim to follow up with your neighbor
            and complete the delivery in the next day or two.`,
            })}
          </Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="body2">
            <em>
              {str("webapp:deliveryNeeded.dialog.reminder", {
                defaultValue: `Reminder: Please don’t volunteer for delivery if you have any
              COVID-19/cold/flu-like symptoms, or have come into contact with
              someone that’s tested positive. If you have been in large crowds
              or demonstrations, please self-isolate for 14 days or wait 5 days
              to get a test, and resume deliveries after testing negative.`,
              })}
            </em>
          </Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="body2">
            Delivery code:
            {requestCode}
          </Typography>
        </Box>
      </DialogContent>
      <Box mb={2}>
        <DialogActions className={classes.infoActionsContainer}>
          <a href="#todo" onClick={handleGetMoreInfo}>
            <Typography variant="body2">
              {str("webapp:deliveryNeeded.dialog.more_info_btn", {
                defaultValue: "Wait, I need more information.",
              })}
            </Typography>
          </a>
          <Button color="primary" variant="contained" onClick={handleAccept}>
            <Typography variant="button">
              {str("webapp:deliveryNeeded.dialog.accept_btn", {
                defaultValue: "YES, I will take on this delivery.",
              })}
            </Typography>
          </Button>
        </DialogActions>
      </Box>
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
      <DialogContent className={classes.centeredContent}>
        <Typography variant="body2">
          {str("webapp:deliveryNeeded.dialog.form", {
            defaultValue:
              "Please provide your phone number so we can text you the details of the delivery. You must be registered as a delivery volunteer in our system.",
          })}
        </Typography>
        <MuiPhoneNumber
          required
          defaultCountry="us"
          onlyCountries={["us"]}
          onChange={(value) => setPhoneNumber(value)}
          onKeyDown={(e) => {
            // if enter, submit
            if (e.keyCode === 13) {
              handleSubmit();
            }
          }}
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

export const ErrorMessage = ({ message }) => {
  const classes = useStyles();
  const { t: str } = useTranslation();

  return (
    <>
      <DialogTitle>
        {str("webapp:deliveryNeeded.dialog.errorTitle", {
          defaultValue: "Something went wrong!",
        })}
      </DialogTitle>
      <DialogContent classes={classes.centeredContent}>
        <Typography variant="body2">
          <p>{message || str("webapp:deliveryNeeded.dialog.errorBody")}</p>
        </Typography>
      </DialogContent>
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
        <Typography variant="body2">
          {str("webapp:deliveryNeeded.dialog.finish", {
            defaultValue:
              "You will receive a text message with further instructions in a few moments.",
          })}
        </Typography>
        <CheckCircleIcon fontSize="large" color="primary" />
      </DialogContent>
    </>
  );
};
