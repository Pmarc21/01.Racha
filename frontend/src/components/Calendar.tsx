import { useEffect, useState } from "react";
import {
  Paper,
  Text,
  Group,
  ActionIcon,
  SimpleGrid,
  Stack,
  Tooltip,
  Loader,
} from "@mantine/core";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { apiFetch } from "../api";

dayjs.locale("es");

type DayDetail = {
  date: string;
  points: number;
  actions: string[];
};

type HistoryData = {
  days: DayDetail[];
  max_daily_points: number;
};

const ACTION_EMOJIS: Record<string, string> = {
  gym: "💪",
  creatina: "💊",
  skincare: "🧴",
};

function getColor(points: number, max: number): string {
  if (points === 0) return "transparent";
  const ratio = points / max;
  if (ratio <= 0.33) return "rgba(139, 92, 246, 0.25)";
  if (ratio <= 0.66) return "rgba(139, 92, 246, 0.5)";
  return "rgba(139, 92, 246, 0.85)";
}

export default function Calendar() {
  const [current, setCurrent] = useState(dayjs());
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async (d: dayjs.Dayjs) => {
    setLoading(true);
    try {
      const res = await apiFetch(
        `/api/v1/dashboard/history?year=${d.year()}&month=${d.month() + 1}`
      );
      setHistory(res);
    } catch {
      setHistory(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(current);
  }, [current]);

  const goBack = () => setCurrent((c) => c.subtract(1, "month"));
  const goForward = () => {
    if (current.isBefore(dayjs(), "month")) {
      setCurrent((c) => c.add(1, "month"));
    }
  };

  const daysInMonth = current.daysInMonth();
  const firstDayOfWeek = current.startOf("month").day();
  // Adjust so Monday = 0
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const dayMap = new Map<number, DayDetail>();
  if (history) {
    for (const d of history.days) {
      dayMap.set(dayjs(d.date).date(), d);
    }
  }

  const maxPts = history?.max_daily_points || 5;
  const today = dayjs();

  const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

  const cells = [];
  // Empty cells for offset
  for (let i = 0; i < offset; i++) {
    cells.push(<div key={`empty-${i}`} />);
  }
  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const detail = dayMap.get(day);
    const pts = detail?.points || 0;
    const isToday =
      current.year() === today.year() &&
      current.month() === today.month() &&
      day === today.date();
    const isFuture = current.year() === today.year()
      && current.month() === today.month()
      && day > today.date();

    const tooltipLines = detail?.actions.map(
      (a) => `${ACTION_EMOJIS[a] || ""} ${a}`
    );
    const tooltipText = tooltipLines?.length
      ? `${pts} pts — ${tooltipLines.join(", ")}`
      : "Sin actividad";

    cells.push(
      <Tooltip key={day} label={tooltipText} withArrow position="top" events={{ hover: true, focus: true, touch: true }}>
        <div
          style={{
            aspectRatio: "1",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isFuture ? "transparent" : getColor(pts, maxPts),
            border: isToday
              ? "2px solid var(--mantine-color-violet-5)"
              : "1px solid rgba(255,255,255,0.06)",
            cursor: "default",
            opacity: isFuture ? 0.3 : 1,
            fontSize: "0.8rem",
            fontWeight: isToday ? 700 : 400,
            color: pts > 0 ? "#fff" : "rgba(255,255,255,0.4)",
          }}
        >
          {day}
        </div>
      </Tooltip>
    );
  }

  return (
    <Paper withBorder p="lg" radius="md">
      <Group justify="space-between" align="center" mb="md">
        <ActionIcon variant="subtle" onClick={goBack} size="lg">
          ‹
        </ActionIcon>
        <Text fw={600} size="sm" tt="capitalize">
          {current.format("MMMM YYYY")}
        </Text>
        <ActionIcon
          variant="subtle"
          onClick={goForward}
          size="lg"
          disabled={!current.isBefore(dayjs(), "month")}
        >
          ›
        </ActionIcon>
      </Group>

      {loading ? (
        <Group justify="center" py="xl">
          <Loader color="violet" size="sm" />
        </Group>
      ) : (
        <Stack gap={4}>
          <SimpleGrid cols={7} spacing={4}>
            {weekDays.map((d) => (
              <Text
                key={d}
                size="xs"
                c="dimmed"
                ta="center"
                fw={500}
              >
                {d}
              </Text>
            ))}
          </SimpleGrid>
          <SimpleGrid cols={7} spacing={4}>
            {cells}
          </SimpleGrid>
        </Stack>
      )}

      {/* Legend */}
      <Group justify="center" mt="md" gap="xs">
        <Text size="xs" c="dimmed">
          Menos
        </Text>
        {[0, 0.25, 0.5, 0.85].map((opacity, i) => (
          <div
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              background:
                opacity === 0
                  ? "rgba(255,255,255,0.06)"
                  : `rgba(139, 92, 246, ${opacity})`,
            }}
          />
        ))}
        <Text size="xs" c="dimmed">
          Más
        </Text>
      </Group>
    </Paper>
  );
}
