import { Container, Title, Text, Button, Group } from "@mantine/core";

export default function App() {
  const logout = () => {
    localStorage.removeItem("access_token");
    window.location.reload();
  };

  return (
    <Container size="sm" my={40}>
      <Group justify="space-between" align="center">
        <Title order={1}>Racha</Title>
        <Button variant="subtle" color="gray" onClick={logout}>
          Cerrar sesión
        </Button>
      </Group>
      <Text c="dimmed" mt="md">
        App principal
      </Text>
    </Container>
  );
}
