import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Container,
  Stack,
  SegmentedControl,
  Alert,
} from "@mantine/core";

const API_URL = import.meta.env.VITE_API_URL || "";

type AuthScreensProps = {
  onLoginSuccess: () => void;
};

function Login({ onLoginSuccess }: AuthScreensProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(`${API_URL}/auth/jwt/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      if (!response.ok) throw new Error("Credenciales incorrectas");

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          label="Email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          required
          size="md"
        />
        <PasswordInput
          label="Contraseña"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          required
          size="md"
        />
        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}
        <Button type="submit" fullWidth size="md" loading={loading} mt="xs">
          Iniciar sesión
        </Button>
      </Stack>
    </form>
  );
}

function Register({ onLoginSuccess }: AuthScreensProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Error al registrar usuario");

      setSuccess("Cuenta creada. Ya puedes iniciar sesión.");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          label="Email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          required
          size="md"
        />
        <PasswordInput
          label="Contraseña"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          required
          size="md"
          minLength={6}
        />
        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}
        {success && (
          <Alert color="green" variant="light">
            {success}
          </Alert>
        )}
        <Button type="submit" fullWidth size="md" loading={loading} mt="xs">
          Crear cuenta
        </Button>
      </Stack>
    </form>
  );
}

export default function AuthScreens({ onLoginSuccess }: AuthScreensProps) {
  const [screen, setScreen] = useState<string>("login");

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900} style={{ fontSize: "2.2rem" }}>
        Racha
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5} mb={30}>
        {screen === "login"
          ? "Inicia sesión en tu cuenta"
          : "Crea tu cuenta para empezar"}
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md">
        <SegmentedControl
          value={screen}
          onChange={setScreen}
          fullWidth
          mb="lg"
          data={[
            { label: "Login", value: "login" },
            { label: "Registro", value: "register" },
          ]}
        />

        {screen === "login" ? (
          <Login onLoginSuccess={onLoginSuccess} />
        ) : (
          <Register onLoginSuccess={onLoginSuccess} />
        )}
      </Paper>
    </Container>
  );
}
