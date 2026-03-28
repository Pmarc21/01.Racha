import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Switch,
  Badge,
  Loader,
  Alert,
} from "@mantine/core";
import { apiFetch } from "../api";

type ActionStatus = {
  key: string;
  label: string;
  emoji: string;
  points: number;
  completed: boolean;
};

type DashboardData = {
  date: string;
  actions: ActionStatus[];
  today_points: number;
  total_points: number;
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await apiFetch("/api/v1/dashboard");
      setData(res);
      setError(null);
    } catch {
      setError("No se pudo cargar el dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggle = async (actionKey: string) => {
    if (!data) return;
    setToggling(actionKey);

    // Optimistic update
    setData({
      ...data,
      actions: data.actions.map((a) =>
        a.key === actionKey ? { ...a, completed: !a.completed } : a
      ),
    });

    try {
      const res = await apiFetch(`/api/v1/dashboard/${actionKey}/toggle`, {
        method: "POST",
      });
      setData((prev) =>
        prev
          ? {
              ...prev,
              today_points: res.today_points,
              total_points: res.total_points,
              actions: prev.actions.map((a) =>
                a.key === actionKey ? { ...a, completed: res.completed } : a
              ),
            }
          : prev
      );
    } catch {
      // Revert optimistic update
      fetchDashboard();
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <Container size="xs" py="xl" style={{ textAlign: "center" }}>
        <Loader color="violet" />
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container size="xs" py="xl">
        <Alert color="red" variant="light">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Stack gap="lg">
      {/* Points summary */}
      <Paper withBorder p="lg" radius="md">
        <Group justify="space-between" align="center">
          <div>
            <Text size="sm" c="dimmed" fw={500}>
              Puntos hoy
            </Text>
            <Title order={2}>{data.today_points}</Title>
          </div>
          <div style={{ textAlign: "right" }}>
            <Text size="sm" c="dimmed" fw={500}>
              Total acumulado
            </Text>
            <Title order={2} c="violet">
              {data.total_points}
            </Title>
          </div>
        </Group>
      </Paper>

      {/* Actions */}
      <Stack gap="sm">
        <Text size="sm" c="dimmed" fw={500}>
          Acciones de hoy
        </Text>
        {data.actions.map((action) => (
          <Paper key={action.key} withBorder p="md" radius="md">
            <Group justify="space-between" align="center">
              <Group gap="sm">
                <Text size="xl">{action.emoji}</Text>
                <div>
                  <Text fw={500}>{action.label}</Text>
                  <Badge
                    size="sm"
                    variant="light"
                    color={action.completed ? "green" : "gray"}
                  >
                    +{action.points} pt{action.points > 1 ? "s" : ""}
                  </Badge>
                </div>
              </Group>
              <Switch
                checked={action.completed}
                onChange={() => handleToggle(action.key)}
                disabled={toggling === action.key}
                color="violet"
                size="lg"
              />
            </Group>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}
