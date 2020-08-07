import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import sharedStylesFn from "webapp/style/sharedStyles";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

const useStyles = makeStyles((theme) => ({
  ...sharedStylesFn(theme),
  bodyContainer: {
    padding: theme.spacing(2, 3),
    display: "flex",
    flexDirection: "column",
  },
  closeIcon: {
    cursor: "pointer",
    position: "absolute",
    right: 0,
    top: 0,
    margin: theme.spacing(1),
  },
  titleClass: {
    marginTop: theme.spacing(2),
  },
  formsContainer: {
    marginBottom: theme.spacing(3),
  },
  formButtonsContainer: {
    display: "flex",
  },
  infoButtonsContainer: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: theme.spacing(3),
  },
  backButton: {
    backgroundColor: "lightgray",
  },
  moreInfoButtons: {
    paddingTop: theme.spacing(2),
  },
  finishStep: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

const InfoStep = ({ handleAccept, handleGetMoreInfo, requestCode }) => {
  const classes = useStyles();
  const { t: str } = useTranslation();

  return (
    <>
      <DialogTitle className={classes.titleClass}>
        {str("webapp:deliveryNeeded.dialog.title", {
          defaultValue: "What it means to do a delivery",
        })}
      </DialogTitle>
      <div className={classes.bodyContainer}>
        <Typography variant="body2">
          {"\nLorem ipsum stuff\n"}
          {requestCode}
          {"\nIf you agree, please provide your phone number etc"}
        </Typography>
        <div className={classes.infoButtonsContainer}>
          <a href="#todo" onClick={handleGetMoreInfo}>
            <Typography variant="body2">
              {str("webapp:deliveryNeeded.dialog", {
                defaultValue: "No, I need more information.",
              })}
            </Typography>
          </a>
          <Button color="primary" variant="contained" onClick={handleAccept}>
            <Typography variant="body2">
              {str("webapp:deliveryNeeded.dialog", {
                defaultValue: "Yes, I accept.",
              })}
            </Typography>
          </Button>
        </div>
      </div>
    </>
  );
};

const FormStep = ({ handleFinish }) => {
  const classes = useStyles();
  const { t: str } = useTranslation();

  return (
    <>
      <DialogTitle className={classes.titleClass}>
        {str("webapp:deliveryNeeded.dialog.title", {
          defaultValue: "Contact information",
        })}
      </DialogTitle>
      <div className={classes.bodyContainer}>
        <form className={classes.formsContainer}>
          <FormControlLabel
            control={
              <TextField label="Phone number" variant="outlined" size="small" />
            }
            label="Please provide your phone number"
            labelPlacement="top"
          />
        </form>
        <Button color="primary" variant="contained" onClick={handleFinish}>
          <Typography variant="body2">
            {str("webapp:deliveryNeeded.dialog.submit", {
              defaultValue: "Submit",
            })}
          </Typography>
        </Button>
      </div>
    </>
  );
};

const MoreInfoStep = ({ handleGoBack }) => {
  const classes = useStyles();
  const { t: str } = useTranslation();
  return (
    <>
      <DialogTitle className={classes.titleClass}>
        {str("webapp:deliveryNeeded.dialog.title", {
          defaultValue: "What it means to do a delivery",
        })}
      </DialogTitle>
      <div className={classes.bodyContainer}>
        <Typography variant="body2">
          {str("webapp:deliveryNeeded.dialog.description", {
            defaultValue: "lorum ipsumthin todo",
          })}
        </Typography>
        <span className={classes.moreInfoButtons}>
          <Button onClick={handleGoBack} className={classes.backButton}>
            {str("webapp:deliveryNeeded.dialog.backButton", {
              defaultValue: "Back",
            })}
          </Button>
        </span>
      </div>
    </>
  );
};

const FinishStep = () => {
  const classes = useStyles();
  const { t: str } = useTranslation();

  return (
    <>
      <DialogTitle className={classes.titleClass}>
        {str("webapp:deliveryNeeded.dialog.finish", {
          defaultValue: "Thank you!",
        })}
      </DialogTitle>
      <div className={`${classes.bodyContainer} ${classes.finishStep}`}>
        <CheckCircleIcon fontSize="large" color="primary" />
      </div>
    </>
  );
};

const ClaimDeliveryDialog = ({ open, onClose, requestCode }) => {
  const classes = useStyles();
  const { t: str } = useTranslation();
  const [activeStep, setStep] = useState("info");

  const steps = {
    info: (
      <InfoStep
        handleAccept={() => setStep("form")}
        handleGetMoreInfo={() => setStep("moreInfo")}
        requestCode={requestCode}
      />
    ),
    form: <FormStep handleFinish={() => setStep("finish")} />,
    moreInfo: <MoreInfoStep handleGoBack={() => setStep("info")} />,
    finish: <FinishStep />,
  };

  const handleClose = () => {
    onClose();
    setStep("info");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby={str("webapp:deliveryNeeded.dialog.description", {
        defaultValue: "Claim a delivery",
      })}
      aria-describedby={str("webapp:deliveryNeeded.dialog.description", {
        defaultValue: "Consent dialog form for claiming this delivery.",
      })}
    >
      <CloseIcon
        onClick={handleClose}
        fontSize="small"
        className={classes.closeIcon}
      />
      {steps[activeStep]}
    </Dialog>
  );
};

export default ClaimDeliveryDialog;
