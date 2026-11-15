export function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("ru-RU").format(value ?? 0);
}

export function formatMoney(value: number | null | undefined) {
  if (value == null) return "Цена не указана";
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value)} ₽`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(new Date(value));
}

export function pricingLabel(value: string) {
  if (value === "free") return "Бесплатно";
  if (value === "freemium") return "Freemium";
  if (value === "paid") return "Платно";
  return value;
}

export function statusLabel(value: string) {
  if (value === "pending") return "На модерации";
  if (value === "approved") return "В каталоге";
  if (value === "rejected") return "Отклонён";
  return value;
}
