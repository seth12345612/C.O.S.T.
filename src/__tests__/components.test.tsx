import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrbBackground } from "@/components/OrbBackground";

describe("OrbBackground", () => {
  it("renders the decorative orbs", () => {
    render(<OrbBackground />);
    const orbs = document.querySelectorAll(".orb");
    expect(orbs.length).toBe(3);
  });

  it("renders all three orb variants", () => {
    render(<OrbBackground />);
    expect(document.querySelector(".orb-1")).toBeTruthy();
    expect(document.querySelector(".orb-2")).toBeTruthy();
    expect(document.querySelector(".orb-3")).toBeTruthy();
  });
});
