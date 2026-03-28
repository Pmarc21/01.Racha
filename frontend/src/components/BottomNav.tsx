import { Group, UnstyledButton, Text, Stack, Paper } from "@mantine/core";
import type { Page } from "../App";

type Props = {
  active: Page;
  onChange: (page: Page) => void;
};

const tabs: { key: Page; label: string; icon: string }[] = [
  { key: "main", label: "Inicio", icon: "🏠" },
  { key: "calendar", label: "Calendario", icon: "📅" },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <Paper
      withBorder
      radius={0}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderLeft: "none",
        borderRight: "none",
        borderBottom: "none",
        background: "var(--mantine-color-body)",
      }}
    >
      <Group grow gap={0} py="xs" px="md" maw={420} mx="auto">
        {tabs.map((tab) => (
          <UnstyledButton
            key={tab.key}
            onClick={() => onChange(tab.key)}
            style={{ textAlign: "center" }}
          >
            <Stack gap={2} align="center">
              <Text size="xl" lh={1}>
                {tab.icon}
              </Text>
              <Text
                size="xs"
                fw={active === tab.key ? 700 : 400}
                c={active === tab.key ? "violet" : "dimmed"}
              >
                {tab.label}
              </Text>
            </Stack>
          </UnstyledButton>
        ))}
      </Group>
    </Paper>
  );
}
