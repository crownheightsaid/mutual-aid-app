import React from "react";
import JsonTable from "ts-react-json-table";

const DeliveryTable = ({ rows }) => {
  return (
    <JsonTable
      rows={rows}
      columns={[
        "Code",
        "Cross Street #1",
        "Cross Street #2",
        "First Name",
        {
          key: "slackPermalink",
          label: "Slack Link",
          cell(row) {
            return (
              <a
                href={row.slackPermalink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Slack
              </a>
            );
          }
        }
      ]}
    />
  );
};

export default DeliveryTable;
