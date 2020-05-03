import React from "react";
import { useTranslation } from "react-i18next";

const MissingMap = () => {
  const { t: str } = useTranslation();
  return (
    <div>
      {str("webapp:zoneFinder.map.error")}
      &nbsp;
      <a href={str("webapp:slack.techChannelUrl")}>
        {str("webapp:slack.techChannel")}
      </a>
    </div>
  );
};

export default MissingMap;
