import React, { Suspense } from "react";
import { Router, Redirect } from "@reach/router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import NeighborhoodFinder from "./pages/NeighborhoodFinder";
import "./style/globals.css";
import "lib/strings/i18nextInit";
import DeliveryNeeded from "./pages/DeliveryNeeded";

function App() {
  return (
    <Suspense fallback="loading">
      <Router>
        <Layout path="/">
          <Redirect from="/en/neighborhood-finder" to="/neighborhood-finder" />
          {/* Only components from /pages should be nested here */}
          <Home path="/" />
          <NeighborhoodFinder path="/neighborhood-finder" />
          <DeliveryNeeded path="/delivery-needed" />
        </Layout>
      </Router>
    </Suspense>
  );
}

export default App;
