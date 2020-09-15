import React, { useState, useContext } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import Dialog from "@material-ui/core/Dialog";
import CircularProgress from "@material-ui/core/CircularProgress";
import DeliveryContext from "../../context/DeliveryContext";
import {
  InfoStep,
  InstructionsStep,
  FormStep,
  FinishStep,
  ErrorMessage,
} from "./DialogScreens";

const DeliveryDialog = ({ open, onClose, fetchData }) => {
  const { requestCode } = useContext(DeliveryContext);
  const { t: str } = useTranslation();
  const [activeStep, setStep] = useState("info");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      await axios.post(`/api/delivery-needed/assign`, {
        requestCode,
        phoneNumber,
      });
      setStep("finish");
    } catch (err) {
      const {
        response: {
          data: { message },
        },
      } = err;

      if (message)
        setError(`We're sorry! Please contact #tech_support. ${message}`);
      else
        setError(
          "We're sorry! Something went wrong while processing your request. Things that could have gone wrong include: we couldn't find the delivery request code, you haven't registered as a volunteer, or you entered the wrong phone number. Please contact #tech_support."
        );

      setStep("error");
    }

    setLoading(false);
  };

  const handleExit = () => {
    const dialogState = activeStep;
    // reset state
    setPhoneNumber("");
    setStep("info");
    // refetch data to update the map if claim request was successful
    if (dialogState === "finish") fetchData();
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
      {loading && <CircularProgress />}
      {!loading && steps[activeStep]}
    </Dialog>
  );
};

export default DeliveryDialog;
