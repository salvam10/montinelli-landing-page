import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Landing } from "./components/Landing";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Landing />
  </StrictMode>
);
