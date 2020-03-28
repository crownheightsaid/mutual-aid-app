import React from "react";
import IntlRouter from "./components/IntlRouter";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import NeighborhoodFinder from "./pages/NeighborhoodFinder";
import "./style/globals.css";

function App() {
  return (
    <IntlRouter>
      <Layout path="/">
        {/* Only components from /pages should be nested here */}
        <Home path="/" />
        <NeighborhoodFinder path="/neighborhood-finder" />
      </Layout>
    </IntlRouter>
  );
}

export default App;
