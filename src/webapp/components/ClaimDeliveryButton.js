import React, { useContext } from "react";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { useTranslation } from "react-i18next";
import DeliveryContext from "../context/DeliveryContext";

const ClaimDeliveryButton = ({ className, requestCode }) => {
  const { t: str } = useTranslation();

  const deliveryContext = useContext(DeliveryContext);

  return (
    <Button
      size="small"
      variant="contained"
      color="primary"
      onClick={() => deliveryContext.handleOpenClaimDialog(requestCode)}
      className={className}
    >
      <Typography variant="button">
        {str("webapp:deliveryNeeded.popup.claimDelivery", {
          defaultValue: "Claim delivery",
        })}
      </Typography>
    </Button>
  );
};

export default ClaimDeliveryButton;
