import React, { useState } from "react";
import useAxios from "axios-hooks";
import { CircularProgress } from "@material-ui/core";
import InputAdornment from "@material-ui/core/InputAdornment";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

const SaveNeighborhoodData = ({ neighborhoodData, className }) => {
  const [requestCode, setRequestCode] = useState("");
  const [{ data, loading, error }, submit] = useAxios(
    {
      url: `/api/authed/intake/neighborhood-finder`,
      method: "post"
    },
    { manual: true } // Don't send on render
  );

  const handleAddToAirtable = event => {
    event.preventDefault();
    submit({
      data: {
        requestCode,
        neighborhoodData
      }
    });
  };
  return (
    <>
      <TextField
        id="request_code"
        name="request_code"
        label="Request code, e.g. V8DL"
        type="text"
        margin="normal"
        variant="outlined"
        onChange={e => setRequestCode(e.target.value)}
        className={className}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Button
                variant="contained"
                color="primary"
                aria-label="request_code"
                onClick={handleAddToAirtable}
              >
                Add info to Airtable
              </Button>
            </InputAdornment>
          )
        }}
      />
      {loading && <CircularProgress />}
      {error && <div>err:{JSON.stringify(error)}</div>}
      {data && <div>{JSON.stringify(data)}</div>}
    </>
  );
};

export default SaveNeighborhoodData;
