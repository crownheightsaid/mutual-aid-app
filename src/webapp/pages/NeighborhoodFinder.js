import React, { useState } from "react";

import useAxios from "axios-hooks";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Button from "@material-ui/core/Button";
import JustTextContent from "../components/JustTextContext";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "55%"
    }
  },
  field: {
    marginTop: theme.spacing(3),
    width: "85%"
  },
  text: {
    marginBottom: theme.spacing(1)
  }
}));

export default function NeighborhoodFinder() {
  const classes = useStyles();
  const [formAddress, setAddress] = useState("");
  const [{ data, loading, error }, submit] = useAxios(
    {
      url: `/geo/address-metadata`,
      method: "post"
    },
    { manual: true }
  );

  const handleSubmit = event => {
    event.preventDefault();
    submit({
      data: {
        address: formAddress
      }
    });
  };

  return (
    <Box className={classes.root}>
      <Typography className={classes.text} variant="body1">
        Enter an address and we'll look up cross streets and the neighborhood.
      </Typography>
      <Typography className={classes.text} variant="body1">
        If the address is in a Crown Heights quadrant, we'll let you know.
      </Typography>
      <Typography className={classes.text} variant="body1">
        The address will not be stored or logged.
      </Typography>
      <form onSubmit={handleSubmit} autoComplete="off">
        <TextField
          id="address"
          name="address"
          label="Address"
          type="text"
          margin="normal"
          variant="outlined"
          required
          onChange={e => setAddress(e.target.value)}
          className={classes.field}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button aria-label="address-submit" onClick={handleSubmit}>
                  Submit
                </Button>
              </InputAdornment>
            )
          }}
        />
      </form>

      {data && (
        <>
          <TextField
            disabled
            id="cross-1"
            label="Cross Street #1"
            defaultValue={data.intersection.street_1}
            variant="outlined"
            className={classes.field}
          />
          <TextField
            disabled
            id="cross-2"
            label="Cross Street #2"
            defaultValue={data.intersection.street_2}
            variant="outlined"
            className={classes.field}
          />
          <TextField
            disabled
            id="zone"
            label="Crown Heights Volunteer Zone"
            defaultValue={data.quadrant || "Unavailable"}
            variant="outlined"
            className={classes.field}
          />
          <TextField
            disabled
            id="neighborhood"
            label="Neighborhood"
            defaultValue={data.neighborhoodName || "Unavailable"}
            variant="outlined"
            className={classes.field}
          />
        </>
      )}
      {loading && <CircularProgress />}
      {error && (
        <JustTextContent body="Error loading. Please try again. If it doesn't work, post in #tech." />
      )}
    </Box>
  );
}
