import React, { useState } from "react";
import useAxios from "axios-hooks";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress } from "@material-ui/core";
import InputAdornment from "@material-ui/core/InputAdornment";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles(theme => ({
  successMessage: {
    color: theme.palette.success.dark
  },
  field: {
    marginTop: theme.spacing(1),
    width: "85%"
  }
}));

const forceInputUppercase = e => {
  e.target.value = (e.target.value || "").toUpperCase();
};

const SaveNeighborhoodDataInput = ({ neighborhoodData, className }) => {
  const { t: str } = useTranslation();
  const classes = useStyles();
  const [requestCode, setRequestCode] = useState("");
  const [{ data, loading, error }, submit] = useAxios(
    {
      url: `/api/neighborhood-finder/update-request`,
      method: "post"
    },
    { manual: true } // Don't send on render
  );

  const handleAddToAirtable = event => {
    event.preventDefault();

    submit({
      data: {
        requestCode: requestCode.toUpperCase(),
        neighborhoodData
      }
    });
  };

  return (
    <Box className={className}>
      <form onSubmit={handleAddToAirtable} autoComplete="off">
        <Typography variant="h6">
          {str(
            "webapp:zoneFinder.airtableUpdate.message",
            "Update a request with the above address"
          )}
        </Typography>
        <TextField
          id="request_code"
          name="request_code"
          label={str("webapp:zoneFinder.airtableUpdate.codeLabel")}
          type="text"
          margin="normal"
          variant="outlined"
          onKeyUp={forceInputUppercase}
          onChange={e => setRequestCode(e.target.value)}
          className={`${classes.field}`}
          error={Boolean(error)}
          helperText={error && error.response.data.message}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  disabled={!requestCode}
                  variant="contained"
                  color="primary"
                  aria-label="request_code"
                  onClick={handleAddToAirtable}
                >
                  {str("webapp:zoneFinder.airtableUpdate.submit")}
                </Button>
              </InputAdornment>
            )
          }}
        />
      </form>
      {loading && <CircularProgress />}
      {!error && data && data.success && (
        <Typography variant="caption" className={classes.successMessage}>
          {str("webapp:zoneFinder.airtableUpdate.success")}
        </Typography>
      )}
    </Box>
  );
};

export default SaveNeighborhoodDataInput;
