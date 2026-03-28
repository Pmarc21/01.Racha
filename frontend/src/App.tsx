import { useState } from "react";
import { Container, Title, Button, Group, Box } from "@mantine/core";
import Dashboard from "./components/Dashboard";
import Calendar from "./components/Calendar";
import BottomNav from "./components/BottomNav";

export type Page = "main" | "calendar";

export default function App() {
  const [page, setPage] = useState<Page>("main");

  const logout = () => {
    localStorage.removeItem("access_token");
    window.location.reload();
  };

  return (
    <>
      <Container size="xs" py="xl" pb={80}>
        <Group justify="space-between" align="center" mb="xl">
          <Title order={1}>Racha</Title>
          <Button variant="subtle" color="gray" size="sm" onClick={logout}>
            Cerrar sesión
          </Button>
        </Group>
        {page === "main" ? <Dashboard /> : <Calendar />}
      </Container>
      <BottomNav active={page} onChange={setPage} />
    </>
  );
}
