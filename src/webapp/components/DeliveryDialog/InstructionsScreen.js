import React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import instrutions from "./instructions.json";

const useStyles = makeStyles(() => ({
  moreInfoActionsContainer: {
    justifyContent: "flex-start",
  },
  backButton: {
    backgroundColor: "lightgray",
  },
}));

const Subtitle = ({ content }) => (
  <Typography variant="subtitle1">{content}</Typography>
);

const Paragraph = ({ content }) => (
  <Typography variant="body2">
    <p>{content}</p>
  </Typography>
);

const UnorderedList = ({ content: children }) => {
  const { t: str } = useTranslation();

  return (
    <ul>
      {children.map((child) => {
        const ChildNode = componentTypeMap[child.typename];
        const opts = {
          ...child,
          content: Array.isArray(child.content)
            ? child.content
            : str("webapp:deliveryNeeded.dialog.instructions", {
                defaultValue: child.content,
              }),
        };

        return React.createElement(ChildNode, { ...opts });
      })}
    </ul>
  );
};

const ListItem = ({ content, variant }) => (
  <Typography variant={variant ?? "body2"}>
    <li>{content}</li>
  </Typography>
);

const componentTypeMap = {
  subtitle1: Subtitle,
  p: Paragraph,
  ul: UnorderedList,
  li: ListItem,
};

const Instructions = () => {
  const { t: str } = useTranslation();

  return (
    <>
      {instrutions.map((block) => {
        const ComponentBlock = componentTypeMap[block.typename];
        const opts = {
          ...block,
          content: str("webapp:deliveryNeeded.dialog.instructions", {
            defaultValue: block.content,
          }),
        };

        return React.createElement(ComponentBlock, { ...opts });
      })}
    </>
  );
};

const InstructionsStep = ({ handleGoBack }) => {
  const classes = useStyles();
  const { t: str } = useTranslation();

  return (
    <>
      <DialogTitle>
        {str("webapp:deliveryNeeded.dialog.title", {
          defaultValue: "How to make a delivery",
        })}
      </DialogTitle>
      <DialogContent>
        <Instructions />
      </DialogContent>
      <DialogActions className={classes.moreInfoActionsContainer}>
        <Button onClick={handleGoBack} className={classes.backButton}>
          {str("webapp:deliveryNeeded.dialog.backButton", {
            defaultValue: "Back",
          })}
        </Button>
      </DialogActions>
    </>
  );
};

export default InstructionsStep;
