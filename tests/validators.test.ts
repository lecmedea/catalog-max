import assert from "node:assert/strict";
import test from "node:test";
import { maxLinkOk, passwordOk, safeNext, searchTerm, slugify, usernameOk } from "../src/lib/validators.ts";

test("password accepts 8 to 72 characters", () => {
  assert.equal(passwordOk("1234567"), false);
  assert.equal(passwordOk("12345678"), true);
  assert.equal(passwordOk("я".repeat(72)), true);
  assert.equal(passwordOk("я".repeat(73)), false);
});

test("username is a short latin handle", () => {
  assert.equal(usernameOk("ab"), false);
  assert.equal(usernameOk("max_catalog"), true);
  assert.equal(usernameOk("каталог"), false);
});

test("slugify transliterates russian titles", () => {
  assert.equal(slugify("Каталог каналов MAX"), "katalog-kanalov-max");
});

test("search term drops filter wildcards", () => {
  assert.equal(searchTerm("  нейро%, сети  "), "нейро сети");
});

test("safeNext keeps local paths", () => {
  assert.equal(safeNext("/dashboard/channels"), "/dashboard/channels");
  assert.equal(safeNext("https://evil.example"), "/dashboard");
  assert.equal(safeNext("//evil.example"), "/dashboard");
});

test("max links stay on max.ru", () => {
  assert.equal(maxLinkOk("https://max.ru/channel_ii_katalog"), true);
  assert.equal(maxLinkOk("http://max.ru/channel_ii_katalog"), false);
  assert.equal(maxLinkOk("https://example.com"), false);
});
