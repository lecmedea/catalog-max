const LETTERS: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "j", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function passwordOk(value: string) {
  return value.length >= 8 && value.length <= 72;
}

export function usernameOk(value: string) {
  return /^[A-Za-z0-9_]{3,24}$/.test(value);
}

export function slugify(input: string) {
  let out = "";
  for (const char of input.trim().toLowerCase()) out += LETTERS[char] ?? char;
  out = out.normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  return out || "kanal";
}

export function searchTerm(raw: string | undefined) {
  return (raw ?? "").replace(/[%_,\\.()\\\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export function safeNext(value: string | null | undefined, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.includes("://")) return fallback;
  return value;
}

export function maxLinkOk(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:" && (host === "max.ru" || host.endsWith(".max.ru"));
  } catch {
    return false;
  }
}

export function httpsUrlOk(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function moneyOk(value: string) {
  if (!value.trim()) return true;
  return /^\d{1,10}(\.\d{1,2})?$/.test(value) && Number(value) >= 0;
}

export function publicError(message: string) {
  if (message.startsWith("Никнейм") || message.startsWith("Укажите") || message.startsWith("В галерее") || message.startsWith("Файл") || message.startsWith("Нужен")) return message;
  if (/already registered/i.test(message)) return "Этот email уже зарегистрирован. Войдите или восстановите пароль.";
  if (/invalid login credentials/i.test(message)) return "Неверный email или пароль.";
  if (/password/i.test(message)) return "Пароль не подошёл. Нужно от 8 до 72 символов.";
  if (/rate limit/i.test(message)) return "Слишком много писем. Подождите и повторите.";
  return "Не удалось выполнить действие. Проверьте данные и повторите.";
}
