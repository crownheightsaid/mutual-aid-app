import React, { useState, useContext } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import Dialog from "@material-ui/core/Dialog";
import DeliveryContext from "../../context/DeliveryContext";
import {
  InfoStep,
  InstructionsStep,
  FormStep,
  FinishStep,
  ErrorMessage,
} from "./DialogScreens";

const ClaimDeliveryDialog = ({ open, onClose }) => {
  const { requestCode } = useContext(DeliveryContext);
  const { t: str } = useTranslation();
  const [activeStep, setStep] = useState("info");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState();

  const onSubmit = async () => {
    try {
      await axios.post(`/api/delivery-needed/assign`, {
        requestCode,
        phoneNumber,
      });
      setStep("finish");
    } catch ({ message }) {
      setError(
        `We're sorry! Something went wrong while processing your request. Please contact #tech_support and include the delivery request code and phone number you provided in your message.`
      );
      setStep("error");
    }
  };

  const handleClose = () => {
    setPhoneNumber("");
    onClose();
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
    error: <ErrorMessage message={error} />,
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
