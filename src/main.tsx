import { createRoot } from "react-dom/client";
import App from "./App";
import { TranslationProvider } from "@/context/TranslationContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <TranslationProvider>
    <App />
  </TranslationProvider>
);
