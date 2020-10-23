import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { rest } from "msw";
import { setupServer } from "msw/node";

import NeighborhoodFinder from "./NeighborhoodFinder";

const VALID_ADDRESS = "valid address";
const INVALID_ADDRESS = "invalid address";
const OUT_OF_BOUNDS_ADDRESS = "out of bounds address";

const getResponseJSON = (overrides = {}) => {
  return {
    neighborhoodName: "Crown Heights",
    location: { lat: 40.6752241, lng: -73.96015539999999 },
    intersection: { street_1: "Classon Ave", street_2: "Park Pl" },
    quadrant: "NW",
    ...overrides,
  };
};

const server = setupServer(
  rest.post("/api/geo/address-metadata", (request, resolver, ctx) => {
    let response;
    let status = 200;
    switch (request.body.address) {
      case VALID_ADDRESS:
        response = getResponseJSON();
        break;
      case INVALID_ADDRESS:
        status = 400;
        response = { error: "blah" };
        break;
      default:
        response = {};
    }
    return resolver(ctx.status(status), ctx.json(response));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("NeighborhoodFinder", () => {
  it("renders an address input", () => {
    render(<NeighborhoodFinder />);
    expect(screen.getByRole("textbox", { name: "Address" })).toBeTruthy();
  });

  it("handles submission of a valid address", (done) => {
    render(<NeighborhoodFinder />);
    const addressInput = screen.getByRole("textbox", { name: "Address" });
    fireEvent.change(addressInput, { target: { value: VALID_ADDRESS } });

    screen.getByText("common:submit").click();

    setTimeout(() => {
      expect(
        screen.getByRole("textbox", {
          name: "webapp:zoneFinder.airtableUpdate.codeLabel",
        })
      ).toBeTruthy();
      done();
    }, 500);
  });
});
