import React, { useState } from "react";

import useAxios from "axios-hooks";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import InputAdornment from "@material-ui/core/InputAdornment";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
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
  link: {
    color: "inherit",
    textDecoration: "none",
    "&:hover": {
      textDecoration: "none"
    }
  },
  divider: {
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(3)
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
      url: `/api/geo/address-metadata`,
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

  const EmailButton = () => {
    return (
      <>
        <Typography className={classes.text} variant="body1">
          You can use the link below to send more resources if needed!
        </Typography>
        <JustTextContent body="" />
        <a
          target="_blank"
          className={classes.link}
          rel="noopener noreferrer"
          href="mailto:?subject=Coronavirus%20Resources%20NYC&body=Sorry%20we%20couldn't%20help%20out%20%3A%2F%0D%0AHere's%20some%20resources%20others%20have%20found%20helpful%3A%0D%0Ahttps%3A%2F%2Fcitylimits.org%2Fnyc-coronavirus-crisis-resources-for-you%2F%0D%0Ahttp%3A%2F%2Fmutualaid.nyc%2Fneighborhood-groups%2F"
        >
          <Button variant="contained" endIcon={<MailOutlineIcon />}>
            Email Aid Resource Links
          </Button>
        </a>
      </>
    );
  };

  return (
    <Box className={classes.root}>
      <Typography className={classes.text} variant="body1">
        Enter an address and we will look up cross streets and the neighborhood.
      </Typography>
      <Typography className={classes.text} variant="body1">
        If the address is in a Crown Heights quadrant, it will let you know!
      </Typography>
      <Typography className={classes.text} variant="body1">
        The address will not be stored or logged :)
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
            id="neighborhood"
            label="Neighborhood"
            defaultValue={data.neighborhoodName || "Unavailable"}
            helperText="If both this and zone are unavailable, double check the map: https://bit.ly/2UrZPkA"
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
          <Divider className={classes.divider} />
          <EmailButton />
        </>
      )}
      {loading && <CircularProgress />}
      {error && (
        <>
          <Typography className={classes.text} variant="body1">
            Error loading. Please try again. If it fails again, let us know in
            <a href="https://crownheightsmutualaid.slack.com/archives/C010AUQ6DFD">
              #tech.
            </a>
          </Typography>
          <Divider className={classes.divider} />
          <EmailButton />
        </>
      )}
    </Box>
  );
}
