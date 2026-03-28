import { useEffect, useState, useCallback } from "react";
import {
  Stack,
  Paper,
  Text,
  Group,
  ActionIcon,
  Button,
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  SegmentedControl,
  Badge,
  Loader,
  Alert,
  Checkbox,
  Divider,
  CloseButton,
  Spoiler,
} from "@mantine/core";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { apiFetch } from "../api";

dayjs.locale("es");

type Ingredient = { id?: number; name: string; quantity: string; unit: string };
type Recipe = { id: number; name: string; meal_type: string; notes: string; ingredients: Ingredient[] };
type MenuSlot = {
  id: number;
  day_of_week: number;
  meal_type: string;
  recipe_id: number;
  recipe_name: string;
  servings: number;
};
type ShoppingItem = { name: string; quantity: number; unit: string };

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MEALS = ["comida", "cena"];
const MEAL_LABELS: Record<string, string> = { comida: "Comida", cena: "Cena" };

function getWeekStart(d: dayjs.Dayjs): string {
  return d.startOf("week").add(1, "day").format("YYYY-MM-DD");
}

export default function MenuPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = getWeekStart(dayjs().add(weekOffset, "week"));

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [slots, setSlots] = useState<MenuSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Recipe creation / editing
  const [recipeModal, setRecipeModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newMealType, setNewMealType] = useState("comida");
  const [newNotes, setNewNotes] = useState("");
  const [newIngredients, setNewIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "", unit: "" },
  ]);
  const [saving, setSaving] = useState(false);

  // Slot picker: first pick day, then meal_type, then recipe, then servings
  const [slotDay, setSlotDay] = useState<number | null>(null);
  const [slotMeal, setSlotMeal] = useState<string | null>(null);
  const [slotRecipeId, setSlotRecipeId] = useState<number | null>(null);
  const [slotServings, setSlotServings] = useState(1);

  // Shopping list
  const [shopModal, setShopModal] = useState(false);
  const [shopItems, setShopItems] = useState<ShoppingItem[]>([]);
  const [shopChecked, setShopChecked] = useState<Set<string>>(new Set());
  const [shopLoading, setShopLoading] = useState(false);

  // Recipe list filter
  const [recipeFilter, setRecipeFilter] = useState("todas");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [r, m] = await Promise.all([
        apiFetch("/api/v1/recipes"),
        apiFetch(`/api/v1/menu?week_start=${weekStart}`),
      ]);
      setRecipes(r);
      setSlots(m.slots);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Recipe CRUD ---
  const resetRecipeForm = () => {
    setRecipeModal(false);
    setEditingId(null);
    setNewName("");
    setNewMealType("comida");
    setNewNotes("");
    setNewIngredients([{ name: "", quantity: "", unit: "" }]);
  };

  const openEditRecipe = (r: Recipe) => {
    setEditingId(r.id);
    setNewName(r.name);
    setNewMealType(r.meal_type);
    setNewNotes(r.notes || "");
    setNewIngredients(
      r.ingredients.length > 0
        ? r.ingredients.map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit }))
        : [{ name: "", quantity: "", unit: "" }]
    );
    setRecipeModal(true);
  };

  const handleSaveRecipe = async () => {
    const filtered = newIngredients.filter((i) => i.name.trim());
    if (!newName.trim() || filtered.length === 0) return;
    setSaving(true);
    try {
      const url = editingId
        ? `/api/v1/recipes/${editingId}`
        : "/api/v1/recipes";
      await apiFetch(url, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({
          name: newName.trim(),
          meal_type: newMealType,
          notes: newNotes.trim(),
          ingredients: filtered,
        }),
      });
      resetRecipeForm();
      fetchData();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecipe = async (id: number) => {
    await apiFetch(`/api/v1/recipes/${id}`, { method: "DELETE" });
    fetchData();
  };

  // --- Menu slots ---
  const handlePickRecipe = (recipeId: number) => {
    setSlotRecipeId(recipeId);
    setSlotServings(1);
  };

  const handleConfirmSlot = async () => {
    if (slotDay === null || !slotMeal || !slotRecipeId) return;
    await apiFetch("/api/v1/menu/slot", {
      method: "PUT",
      body: JSON.stringify({
        week_start: weekStart,
        day_of_week: slotDay,
        meal_type: slotMeal,
        recipe_id: slotRecipeId,
        servings: slotServings,
      }),
    });
    closeSlotModal();
    fetchData();
  };

  const closeSlotModal = () => {
    setSlotDay(null);
    setSlotMeal(null);
    setSlotRecipeId(null);
    setSlotServings(1);
  };

  const handleRemoveSlot = async (slotId: number) => {
    await apiFetch(`/api/v1/menu/slot/${slotId}`, { method: "DELETE" });
    fetchData();
  };

  // --- Shopping list ---
  const openShoppingList = async () => {
    setShopModal(true);
    setShopLoading(true);
    setShopChecked(new Set());
    try {
      const res = await apiFetch(
        `/api/v1/menu/shopping-list?week_start=${weekStart}`
      );
      setShopItems(res.items);
    } catch {
      setShopItems([]);
    } finally {
      setShopLoading(false);
    }
  };

  const toggleShopItem = (key: string) => {
    setShopChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // --- Helpers ---
  const getSlots = (day: number, meal: string) =>
    slots.filter((s) => s.day_of_week === day && s.meal_type === meal);

  // Recipes filtered for the slot picker modal (match meal_type)
  const slotRecipes = slotMeal
    ? recipes.filter((r) => r.meal_type === slotMeal)
    : [];

  // Recipes filtered for the list view
  const filteredRecipes =
    recipeFilter === "todas"
      ? recipes
      : recipes.filter((r) => r.meal_type === recipeFilter);

  if (loading) {
    return (
      <Group justify="center" py="xl">
        <Loader color="violet" />
      </Group>
    );
  }

  return (
    <Stack gap="lg">
      {/* Week nav */}
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" align="center">
          <ActionIcon variant="subtle" onClick={() => setWeekOffset((o) => o - 1)} size="lg">
            ‹
          </ActionIcon>
          <Text fw={600} size="sm">
            {dayjs(weekStart).format("D")} - {dayjs(weekStart).add(6, "day").format("D MMMM YYYY")}
          </Text>
          <ActionIcon variant="subtle" onClick={() => setWeekOffset((o) => o + 1)} size="lg">
            ›
          </ActionIcon>
        </Group>
      </Paper>

      {/* Menu grid */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr>
              <th style={{ width: 80 }} />
              {DAYS.map((d, i) => (
                <th key={i} style={{ padding: "6px 4px", textAlign: "center" }}>
                  <Group gap={4} justify="center" align="center" wrap="nowrap">
                    <Text size="xs" fw={600} c="dimmed">
                      {d} {dayjs(weekStart).add(i, "day").date()}
                    </Text>
                    <ActionIcon
                      variant="subtle"
                      size="xs"
                      color="violet"
                      onClick={() => setSlotDay(i)}
                    >
                      <Text size="xs" lh={1}>+</Text>
                    </ActionIcon>
                  </Group>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEALS.map((meal) => (
              <tr key={meal}>
                <td style={{ padding: "6px 4px", verticalAlign: "top" }}>
                  <Text size="xs" fw={600} c="dimmed">
                    {MEAL_LABELS[meal]}
                  </Text>
                </td>
                {DAYS.map((_, dayIdx) => {
                  const cellSlots = getSlots(dayIdx, meal);
                  return (
                    <td key={dayIdx} style={{ padding: 3, verticalAlign: "top" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, minHeight: 40 }}>
                        {cellSlots.map((s) => (
                          <Paper
                            key={s.id}
                            p="xs"
                            radius="sm"
                            style={{
                              background: meal === "comida"
                                ? "rgba(59, 130, 246, 0.12)"
                                : "rgba(249, 115, 22, 0.12)",
                              border: meal === "comida"
                                ? "1px solid rgba(59, 130, 246, 0.25)"
                                : "1px solid rgba(249, 115, 22, 0.25)",
                              position: "relative",
                            }}
                          >
                            <Text size="xs" fw={500} lineClamp={2} pr={16}>
                              {s.recipe_name}{s.servings > 1 ? ` (×${s.servings})` : ""}
                            </Text>
                            <CloseButton
                              size="xs"
                              onClick={() => handleRemoveSlot(s.id)}
                              style={{ position: "absolute", top: 2, right: 2 }}
                            />
                          </Paper>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <Group>
        <Button variant="light" onClick={() => { resetRecipeForm(); setRecipeModal(true); }}>
          Nueva receta
        </Button>
        <Button
          variant="light"
          color="green"
          onClick={openShoppingList}
          disabled={slots.length === 0}
        >
          Lista de la compra
        </Button>
      </Group>

      {/* Recipes list */}
      {recipes.length > 0 && (
        <Stack gap="xs">
          <Group justify="space-between" align="center">
            <Text size="sm" fw={500} c="dimmed">
              Tus recetas
            </Text>
            <SegmentedControl
              size="xs"
              value={recipeFilter}
              onChange={setRecipeFilter}
              data={[
                { label: "Todas", value: "todas" },
                { label: "Comida", value: "comida" },
                { label: "Cena", value: "cena" },
              ]}
            />
          </Group>
          {filteredRecipes.map((r) => (
            <Paper key={r.id} withBorder p="sm" radius="md">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Group gap="xs" align="center">
                    <Text fw={500} size="sm">
                      {r.name}
                    </Text>
                    <Badge size="xs" variant="light" color={r.meal_type === "comida" ? "blue" : "orange"}>
                      {MEAL_LABELS[r.meal_type]}
                    </Badge>
                  </Group>
                  <Group gap={4} mt={4}>
                    {r.ingredients.map((ing, i) => (
                      <Badge key={i} size="xs" variant="light" color="gray">
                        {ing.quantity} {ing.unit} {ing.name}
                      </Badge>
                    ))}
                  </Group>
                  {r.notes && (
                    <Spoiler maxHeight={0} showLabel="Ver notas" hideLabel="Ocultar" mt={6}>
                      <Text size="xs" c="dimmed" style={{ whiteSpace: "pre-wrap" }}>
                        {r.notes}
                      </Text>
                    </Spoiler>
                  )}
                </div>
                <Group gap={4}>
                  <ActionIcon variant="subtle" size="sm" color="gray" onClick={() => openEditRecipe(r)}>
                    <Text size="xs">✎</Text>
                  </ActionIcon>
                  <CloseButton size="sm" onClick={() => handleDeleteRecipe(r.id)} />
                </Group>
              </Group>
            </Paper>
          ))}
          {filteredRecipes.length === 0 && (
            <Text size="sm" c="dimmed" ta="center" py="sm">
              No hay recetas de {recipeFilter}
            </Text>
          )}
        </Stack>
      )}

      {/* Modal: pick meal type → recipe → servings */}
      <Modal
        opened={slotDay !== null}
        onClose={closeSlotModal}
        title={`${slotDay !== null ? DAYS[slotDay] + " " + dayjs(weekStart).add(slotDay ?? 0, "day").date() : ""} — ${slotRecipeId ? "Personas" : slotMeal ? MEAL_LABELS[slotMeal] : "Elegir tipo"}`}
        size="sm"
      >
        {!slotMeal ? (
          <Stack gap="xs">
            <Button variant="light" color="blue" fullWidth onClick={() => setSlotMeal("comida")}>
              Comida
            </Button>
            <Button variant="light" color="orange" fullWidth onClick={() => setSlotMeal("cena")}>
              Cena
            </Button>
          </Stack>
        ) : slotRecipeId ? (
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              {recipes.find((r) => r.id === slotRecipeId)?.name}
            </Text>
            <NumberInput
              label="¿Cuántas personas?"
              value={slotServings}
              onChange={(v) => setSlotServings(typeof v === "number" ? v : 1)}
              min={1}
              max={20}
              size="md"
            />
            <Button fullWidth onClick={handleConfirmSlot}>
              Añadir
            </Button>
            <Button variant="subtle" size="xs" onClick={() => setSlotRecipeId(null)}>
              Volver
            </Button>
          </Stack>
        ) : slotRecipes.length === 0 ? (
          <Stack gap="xs">
            <Alert variant="light" color="yellow">
              No hay recetas de {MEAL_LABELS[slotMeal].toLowerCase()}. Crea una primero.
            </Alert>
            <Button variant="subtle" size="xs" onClick={() => setSlotMeal(null)}>
              Volver
            </Button>
          </Stack>
        ) : (
          <Stack gap="xs">
            {slotRecipes.map((r) => (
              <Button
                key={r.id}
                variant="light"
                fullWidth
                justify="flex-start"
                onClick={() => handlePickRecipe(r.id)}
              >
                {r.name}
              </Button>
            ))}
            <Button variant="subtle" size="xs" onClick={() => setSlotMeal(null)}>
              Volver
            </Button>
          </Stack>
        )}
      </Modal>

      {/* Modal: create recipe */}
      <Modal
        opened={recipeModal}
        onClose={resetRecipeForm}
        title={editingId ? "Editar receta" : "Nueva receta"}
        size="md"
      >
        <Stack gap="sm">
          <TextInput
            label="Nombre"
            placeholder="Ej: Pollo con arroz"
            value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
          />
          <div>
            <Text size="sm" fw={500} mb={4}>
              Tipo
            </Text>
            <SegmentedControl
              fullWidth
              value={newMealType}
              onChange={setNewMealType}
              data={[
                { label: "Comida", value: "comida" },
                { label: "Cena", value: "cena" },
              ]}
            />
          </div>
          <Textarea
            label="Notas / Receta"
            placeholder="Pasos, trucos, comentarios..."
            value={newNotes}
            onChange={(e) => setNewNotes(e.currentTarget.value)}
            minRows={3}
            autosize
          />
          <Divider label="Ingredientes" />
          {newIngredients.map((ing, idx) => (
            <Group key={idx} gap="xs" align="flex-end">
              <TextInput
                label={idx === 0 ? "Nombre" : undefined}
                placeholder="Tomate"
                value={ing.name}
                onChange={(e) => {
                  const copy = [...newIngredients];
                  copy[idx] = { ...copy[idx], name: e.currentTarget.value };
                  setNewIngredients(copy);
                }}
                style={{ flex: 2 }}
              />
              <TextInput
                label={idx === 0 ? "Cantidad" : undefined}
                placeholder="2"
                value={ing.quantity}
                onChange={(e) => {
                  const copy = [...newIngredients];
                  copy[idx] = { ...copy[idx], quantity: e.currentTarget.value };
                  setNewIngredients(copy);
                }}
                style={{ flex: 1 }}
              />
              <TextInput
                label={idx === 0 ? "Unidad" : undefined}
                placeholder="ud"
                value={ing.unit}
                onChange={(e) => {
                  const copy = [...newIngredients];
                  copy[idx] = { ...copy[idx], unit: e.currentTarget.value };
                  setNewIngredients(copy);
                }}
                style={{ flex: 1 }}
              />
              {newIngredients.length > 1 && (
                <CloseButton
                  onClick={() =>
                    setNewIngredients(newIngredients.filter((_, i) => i !== idx))
                  }
                />
              )}
            </Group>
          ))}
          <Button
            variant="subtle"
            size="xs"
            onClick={() =>
              setNewIngredients([...newIngredients, { name: "", quantity: "", unit: "" }])
            }
          >
            + Añadir ingrediente
          </Button>
          <Button onClick={handleSaveRecipe} loading={saving} mt="sm">
            {editingId ? "Guardar cambios" : "Guardar receta"}
          </Button>
        </Stack>
      </Modal>

      {/* Modal: shopping list */}
      <Modal
        opened={shopModal}
        onClose={() => setShopModal(false)}
        title="Lista de la compra"
        size="sm"
      >
        {shopLoading ? (
          <Group justify="center" py="xl">
            <Loader color="violet" size="sm" />
          </Group>
        ) : shopItems.length === 0 ? (
          <Text c="dimmed" size="sm" ta="center" py="xl">
            No hay ingredientes
          </Text>
        ) : (
          <Stack gap="xs">
            {shopItems.map((item, i) => {
              const key = `${item.name}-${item.unit}`;
              return (
                <Checkbox
                  key={i}
                  checked={shopChecked.has(key)}
                  onChange={() => toggleShopItem(key)}
                  label={
                    <Text
                      size="sm"
                      td={shopChecked.has(key) ? "line-through" : undefined}
                      c={shopChecked.has(key) ? "dimmed" : undefined}
                    >
                      {item.quantity} {item.unit} — {item.name}
                    </Text>
                  }
                />
              );
            })}
            <Divider />
            <Text size="xs" c="dimmed" ta="center">
              {shopChecked.size}/{shopItems.length} comprados
            </Text>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
