import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import AuthGate from "./auth/AuthGate";

const theme = createTheme({
  primaryColor: "violet",
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  defaultRadius: "md",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <AuthGate />
    </MantineProvider>
  </React.StrictMode>
);
