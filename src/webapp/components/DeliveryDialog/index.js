import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import Dialog from "@material-ui/core/Dialog";
import { InfoStep, FormStep, MoreInfoStep, FinishStep } from "./DialogScreens";

const useStyles = makeStyles((theme) => ({
  closeIcon: {
    cursor: "pointer",
    position: "absolute",
    right: 0,
    top: 0,
    margin: theme.spacing(1),
  },
}));

const ClaimDeliveryDialog = ({ open, onClose, requestCode }) => {
  const classes = useStyles();
  const { t: str } = useTranslation();
  const [activeStep, setStep] = useState("info");
  const [phoneNumber, setPhoneNumber] = useState("");

  const onSubmit = () => {
    // mock api request

    // if success:
    setStep("finish")
  };

  const steps = {
    info: (
      <InfoStep
        handleAccept={() => setStep("form")}
        handleGetMoreInfo={() => setStep("moreInfo")}
        requestCode={requestCode}
      />
    ),
    form: (
      <FormStep
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        onSubmit={onSubmit}
      />
    ),
    moreInfo: <MoreInfoStep handleGoBack={() => setStep("info")} />,
    finish: <FinishStep />,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onExited={() => setStep("info")}
      aria-labelledby={str("webapp:deliveryNeeded.dialog.description", {
        defaultValue: "Claim a delivery",
      })}
      aria-describedby={str("webapp:deliveryNeeded.dialog.description", {
        defaultValue: "Consent dialog form for claiming this delivery.",
      })}
    >
      {steps[activeStep]}
    </Dialog>
  );
};

export default ClaimDeliveryDialog;
