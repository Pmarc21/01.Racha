import { useState } from "react";
import App from "../App";
import AuthScreens from "./AuthScreens";

export default function AuthGate() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("access_token")
  );

  if (!isAuthenticated) {
    return (
      <AuthScreens onLoginSuccess={() => setIsAuthenticated(true)} />
    );
  }

  return <App />;
}
