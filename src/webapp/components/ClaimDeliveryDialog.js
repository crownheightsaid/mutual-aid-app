import React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import sharedStylesFn from "webapp/style/sharedStyles";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";

const useStyles = makeStyles((theme) => ({
  ...sharedStylesFn(theme),
  bodyContainer: {
    display: "flex",
    padding: "16px 24px",
  },
}));

const ClaimDeliveryDialog = ({ open, onClose, requestCode }) => {
  const classes = useStyles();
  const { t: str } = useTranslation();

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <DialogTitle>
        {str("webapp:deliveryNeeded.dialog", {
          defaultValue: "What it means to do a delivery",
        })}
      </DialogTitle>
      <Typography variant="body2" className={classes.bodyContainer}>
        {requestCode}
      </Typography>
    </Dialog>
  );
};

export default ClaimDeliveryDialog;
