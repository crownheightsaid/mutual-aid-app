import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
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
import Alert from "@material-ui/lab/Alert";
import Collapse from "@material-ui/core/Collapse";
import Link from "@material-ui/core/Link";
import ArrowRightAltIcon from "@material-ui/icons/ArrowRightAlt";
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

export const InfoStep = ({ handleAccept, requestCode }) => {
  const classes = useStyles();
  const { t: str } = useTranslation();
  const [showReimbursementAlert, setShowReimbursementAlert] = useState();
  const toggleReimbursement = () =>
    setShowReimbursementAlert(!showReimbursementAlert);
  return (
    <>
      <DialogTitle>
        {str("webapp:deliveryNeeded.dialog.title", {
          defaultValue: "Do you agree to complete this delivery?",
        })}
      </DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Alert severity="warning">
            <Typography variant="body2">
              {`Important temporary reimbursement policy change: There is a weekly
              cap for the disbursement of ioby raised funds. `}
              <Link href="#" onClick={toggleReimbursement}>
                <span>Click to read more</span>
                <ArrowRightAltIcon fontSize="inherit" />
              </Link>
              .
            </Typography>
            <Collapse in={showReimbursementAlert}>
              <Box mt={2}>
                <Typography variant="body2" gutterBottom>
                  {`The amount available and left each week from ioby funds can be
                  seen `}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://airtable.com/shr7FfnC4AAwEl6XH/tbluNmyS5qqbNAOPW"
                  >
                    here
                  </a>
                  . Ioby funds will be disbursed in order of requests received.
                  Internal slack crowdsourcing and the CHMA hat are not included
                  in the cap though!
                </Typography>

                <Typography variant="body2" gutterBottom>
                  <strong>Why is this happening? </strong>
                  {`This is a temporary measure so that we can stretch our funding
                  a little longer. More details `}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://docs.google.com/document/d/1-scRL2GAL-DT6Ohm5GpmilmiEm2lh9AT7k3Ew4fPQxA/edit?usp=sharing"
                  >
                    here
                  </a>
                </Typography>
              </Box>
            </Collapse>
          </Alert>
        </Box>

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
            <Trans key="webapp:deliveryNeeded.dialog.deliverySlip">
              <strong>
                {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
                If you have access to a printer, please include this{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={str("webapp:deliveryNeeded.dialog.deliverySlipLink", {
                    defaultValue:
                      "https://drive.google.com/drive/folders/1kxPgZbTW0LkpzhAwEzfuQgZ5l93Vw1EA",
                  })}
                >
                  delivery slip
                </a>
                , which contains additional resources and information, in your
                delivery.
              </strong>
            </Trans>
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
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={str("webapp:deliveryNeeded.dialog.more_info_link", {
              defaultValue:
                "https://docs.google.com/document/d/1gLQsC3QUylavyzEYXWa7MVuk-H0DOnVtQtFm2fBXDQg/preview",
            })}
          >
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
