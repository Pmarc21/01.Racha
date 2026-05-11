import { useState } from "react";
import dayjs from "dayjs";
import { Container, Title, Button, Group } from "@mantine/core";
import Dashboard from "./components/Dashboard";
import Calendar from "./components/Calendar";
import MenuPage from "./components/MenuPage";
import BottomNav from "./components/BottomNav";

export type Page = "main" | "calendar" | "menu";

export default function App() {
  const [page, setPage] = useState<Page>("main");
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));

  const logout = () => {
    localStorage.removeItem("access_token");
    window.location.reload();
  };

  return (
    <>
      <Container size={page === "menu" ? "md" : "xs"} py="xl" pb={80}>
        <Group justify="space-between" align="center" mb="xl">
          <Title order={1}>RachaApp</Title>
          <Button variant="light" color="gray" size="sm" onClick={logout}>
            Cerrar sesión
          </Button>
        </Group>
        {page === "main" && <Dashboard selectedDate={selectedDate} />}
        {page === "calendar" && (
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setPage("main");
            }}
          />
        )}
        {page === "menu" && <MenuPage />}
      </Container>
      <BottomNav active={page} onChange={setPage} />
    </>
  );
}
