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
      if (message.includes("404"))
        setError(
          `We're sorry! Something went wrong while processing your request. Things that could have gone wrong include: we couldn't find the delivery request code, you haven't registered as a volunteer, or you entered the wrong phone number. Please contact #tech_support.`
        );
      else
        setError(
          `We're sorry! Something went wrong while processing your request. Please contact #tech_support and include the delivery request code and phone number you provided in your message.`
        );

      setStep("error");
    }
  };

  const handleExit = () => {
    // reset state
    setPhoneNumber("");
    setStep("info");
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
      onClose={onClose}
      onExited={handleExit}
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
