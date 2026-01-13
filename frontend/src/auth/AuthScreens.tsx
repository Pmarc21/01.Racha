import { useState } from "react";

const API_URL = "http://localhost:8000"; // ej: http://localhost:8000

type AuthScreensProps = {
  onLoginSuccess: () => void;
};

function Login({ onLoginSuccess }: AuthScreensProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/jwt/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Credenciales incorrectas");
      }

      const data = await response.json();

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      onLoginSuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        throw new Error("Error al registrar usuario");
      }

      setSuccess("Usuario registrado correctamente");
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Registro</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Registrarse</button>
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
      </form>
    </div>
  );
}

export default function AuthScreens({ onLoginSuccess }: AuthScreensProps) {
  const [screen, setScreen] = useState<"login" | "register">("login");

  return (
    <>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button onClick={() => setScreen("login")}>Login</button>
        <button
          onClick={() => setScreen("register")}
          style={{ marginLeft: 10 }}
        >
          Registro
        </button>
      </div>

      {screen === "login" ? (
        <Login onLoginSuccess={onLoginSuccess} />
      ) : (
        <Register />
      )}
    </>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: "40px auto",
    padding: 20,
    border: "1px solid #ddd",
    borderRadius: 8,
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  error: {
    color: "red",
  },
  success: {
    color: "green",
  },
};
