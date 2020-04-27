import React, { Suspense } from "react";
import { Router, Redirect } from "@reach/router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import NeighborhoodFinder from "./pages/NeighborhoodFinder";
import "./style/globals.css";
import "../lib/strings/i18nextInit";

function App() {
  return (
    <Suspense fallback="loading">
      <Router>
        <Layout path="/">
          <Redirect from="/en/neighborhood-finder" to="/neighborhood-finder" />
          {/* Only components from /pages should be nested here */}
          <Home path="/" />
          <NeighborhoodFinder path="/neighborhood-finder" />
        </Layout>
      </Router>
    </Suspense>
  );
}

export default App;
