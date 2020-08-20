import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "@material-ui/core/Dialog";
import {
  InfoStep,
  InstructionsStep,
  FormStep,
  FinishStep,
} from "./DialogScreens";

const ClaimDeliveryDialog = ({ open, onClose, requestCode }) => {
  const { t: str } = useTranslation();
  const [activeStep, setStep] = useState("info");
  const [phoneNumber, setPhoneNumber] = useState("");

  const onSubmit = () => {
    // mock api request

    // if success:
    setStep("finish");
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
    moreInfo: <InstructionsStep handleGoBack={() => setStep("info")} />,
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
