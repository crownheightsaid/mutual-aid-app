const sharedStylesFn = (theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  field: {
    marginTop: theme.spacing(2),
    width: "85%",
  },
  link: {
    color: "inherit",
    textDecoration: "none",
    "&:hover": {
      textDecoration: "none",
    },
  },
  divider: {
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(3),
  },
  text: {
    marginBottom: theme.spacing(1),
  },
  paper: {
    padding: theme.spacing(3),
  },
});
export default sharedStylesFn;
