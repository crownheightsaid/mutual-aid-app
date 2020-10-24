import React, { useState } from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import HelpIcon from "@material-ui/icons/Help";
import Grid from "@material-ui/core/Grid";
import { useTranslation } from "react-i18next";

const HelpText = () => {
  const [showHelp, setShowHelp] = useState(false);
  const { t: str } = useTranslation();

  return (
    <Box marginTop={2}>
      <Button
        onClick={() => {
          setShowHelp(!showHelp);
        }}
      >
        <HelpIcon />
        <span>
          {str("webapp:deliveryNeeded.help.title", {
            defaultValue: "How do I use this map?",
          })}
        </span>
      </Button>

      <Dialog
        open={showHelp}
        aria-labelledby="how-to-use-this-map"
        aria-describedby="How to use this map"
      >
        <DialogTitle>{str("webapp:deliveryNeeded.help.title")}</DialogTitle>
        <DialogContent>
          <Grid item xs={12}>
            <Box margin={2}>
              <ul>
                <li>
                  {str("webapp:deliveryNeeded.description.dot", {
                    defaultValue: `Each dot represents a location with one or more requests. This
                  location is only representative of the cross street data. We do not
                  store full addresses.`,
                  })}
                </li>
                <li>
                  {str("webapp:deliveryNeeded.description.clickDot", {
                    defaultValue: `Click on each cluster (large circle with a number) to zoom into
                  individual request.`,
                  })}
                </li>
                <li>
                  {str("webapp:deliveryNeeded.description.popUp", {
                    defaultValue: `Click on a dot to pop up details. There is a link to the Slack post
                  for more details, where you can also claim the delivery.`,
                  })}
                </li>
                <li>
                  {str("webapp:deliveryNeeded.description.multipleRequests", {
                    defaultValue: `Some dots may represent multiple requests at the same cross-streets.
                  Clicking on them will display all of the requests.`,
                  })}
                </li>
              </ul>
            </Box>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={() => setShowHelp(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HelpText;
