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
import QuadrantMap from "../components/QuadrantMap";

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      display: "flex"
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
  },
  mapRoot: {
    flex: 1
  },
  formRoot: {
    flex: 1
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
    { manual: true } // Don't send on render
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
    const resourceLinks = [
      "https://docs.google.com/document/d/18WYGoVlJuXYc3QFN1RABnARZlwDG3aLQsnNokl1KhZQ/edit"
    ];
    let bodyString =
      "Sorry we couldn't help out :/\nHere's a regularly updated list of resources:\n\n";

    resourceLinks.forEach(resourceLink => {
      bodyString += `${resourceLink}\n\n`;
    });

    return (
      <>
        <Typography className={classes.text} variant="body1">
          You can use the link below to send more resources if needed!
        </Typography>
        <a
          target="_blank"
          className={classes.link}
          rel="noopener noreferrer"
          href={`mailto:?subject=Coronavirus%20Resources%20NYC&body=${encodeURIComponent(
            bodyString
          )}`}
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
      <Box className={classes.formRoot}>
        <Box>
          <Typography className={classes.text} variant="h4">
            Crown Heights Neighbourhood Finder
          </Typography>
          <Typography className={classes.text} variant="body1">
            Enter an address and we will look up cross streets and the neighborhood.
          </Typography>
          <Typography className={classes.text} variant="body1">
            For best results, enter street and town (Ex: 1550 dean st brooklyn)
          </Typography>
          <Typography className={classes.text} variant="body1">
            The address will not be stored or logged :)
          </Typography>
        </Box>
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
              value={data.intersection.street_1}
              variant="outlined"
              className={classes.field}
            />
            <TextField
              disabled
              id="cross-2"
              label="Cross Street #2"
              value={data.intersection.street_2}
              variant="outlined"
              className={classes.field}
            />
            <TextField
              disabled
              id="neighborhood"
              label="Neighborhood"
              value={data.neighborhoodName || "Unavailable"}
              helperText="If both this and zone are unavailable, double check the map: https://bit.ly/2UrZPkA"
              variant="outlined"
              className={classes.field}
            />
            <TextField
              disabled
              id="zone"
              label="Crown Heights Volunteer Zone"
              value={data.quadrant || "Unavailable"}
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
              &nbsp;
              <a href="https://crownheightsmutualaid.slack.com/archives/C010AUQ6DFD">
                #tech.
              </a>
            </Typography>
            <Divider className={classes.divider} />
            <EmailButton />
          </>
        )}
      </Box>

      <Box className={classes.mapRoot}>
        <QuadrantMap location={data && data.location} />
      </Box>
    </Box>
  );
}
