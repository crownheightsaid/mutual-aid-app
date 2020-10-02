import React from "react";
import { useTranslation } from "react-i18next";
import Typography from "@material-ui/core/Typography";
import instructions from "./instructions.json";

const Subtitle = ({ content }) => (
  <Typography variant="subtitle1">{content}</Typography>
);

const Paragraph = ({ content }) => (
  <Typography variant="body2">
    {/* We need to allow this so we can render link components. 
      The content here will only come from within this repo and not user-entered 
      or external sources, so we should be safe */}
    {/* eslint-disable-next-line react/no-danger */}
    <p dangerouslySetInnerHTML={{ __html: content }} />
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
      {instructions.map((block) => {
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

export default Instructions;
