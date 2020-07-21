import React from "react";
import Alert from "@material-ui/lab/Alert";
import { useTranslation } from "react-i18next";

// Alert to show when a request from URL param does not exist
const RequestNotFoundAlert = ({ requestCode }) => {
  const { t: str } = useTranslation();
  return (
    <Alert severity="warning">
      {`${str("webapp:deliveryNeeded.requestNotFound.message", {
        defaultValue: `Request with code {{requestCode}} is not found. This means that the request is no longer in 'Delivery Needed' status.`,
        requestCode
      })} `}
      <a
        href={str("webapp:deliveryNeeded.requestNotFound.redirectLink", {
          defaultValue: "/delivery-needed"
        })}
      >
        {str("webapp:deliveryNeeded.requestNotFound.redirectMessage", {
          defaultValue: `See all requests instead.`
        })}
      </a>
    </Alert>
  );
};

const NoRequestsAlert = () => {
  const { t: str } = useTranslation();
  return (
    <Alert severity="warning">
      {str("webapp:deliveryNeeded.noRequests.message", {
        defaultValue:
          "No requests found. Some requests may not have been posted in Slack yet or be marked for driving clusters."
      })}
    </Alert>
  );
};

export { RequestNotFoundAlert, NoRequestsAlert };
