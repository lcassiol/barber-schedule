import { expect, test, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Usuário").fill("admin");
  await page.getByLabel("Senha").fill("local-admin-password-not-for-production");
  const responsePromise = page.waitForResponse((response) => response.request().method() === "POST" && response.url().includes("/api/auth/login"));
  await page.getByRole("button", { name: "Entrar" }).click();
  const setCookie = (await (await responsePromise).allHeaders())["set-cookie"] ?? "";
  await page.waitForURL(/\/admin$/);
  return setCookie;
}

for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
  test(`public schedule is responsive at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/agenda/oficio-barber?date=2027-01-04");
    await expect(page.getByRole("heading", { name: /Seu próximo corte, no seu tempo/i })).toBeVisible();
    await expect(page.getByText(/horários livres/i)).toBeVisible();
    await expect(page.getByText("Ocupado", { exact: true }).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const content = await page.locator("body").innerText();
    expect(content).not.toContain("Cliente Um");
    expect(content).not.toContain("11999999999");
  });
}

test("selecting a time updates the form without reloading the document", async ({ page }) => {
  await page.goto("/agenda/oficio-barber?date=2026-12-01");
  await page.evaluate(() => {
    (window as typeof window & { selectionDocumentMarker?: string }).selectionDocumentMarker = "same-document";
  });
  await page.getByRole("button", { name: /Selecionar/ }).first().click();
  await expect(page).toHaveURL(/slot=/);
  await expect(page.getByText("Horário escolhido", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as typeof window & { selectionDocumentMarker?: string }).selectionDocumentMarker)).toBe("same-document");
});

test("protected panel redirects and authenticated panel shows private details", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByText("local-admin-password-not-for-production", { exact: true })).toBeVisible();
  await login(page);
  await expect(page.getByRole("heading", { name: /Olá, Oficio Barber/i })).toBeVisible();
  await page.waitForTimeout(1_000);
  await page.goto("/admin?date=2027-01-04");
  await expect(page.getByText("Cliente Admin")).toBeVisible();
  await expect(page.getByText("11777777777")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/admin/horarios");
  await expect(page.getByRole("heading", { name: "Horários de trabalho" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("login is non-enumerating, creates a host-appropriate session, and logout revokes it", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Usuário").fill("does-not-exist");
  await page.getByLabel("Senha").fill("wrong-password-value");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("Usuário ou senha inválidos.", { exact: true })).toBeVisible();
  await page.getByLabel("Usuário").fill("admin");
  await page.getByLabel("Senha").fill("local-admin-password-not-for-production");
  const setCookie = await login(page);
  expect(setCookie).toMatch(/HttpOnly/i);
  expect(setCookie).not.toMatch(/;\s*Secure/i);
  expect(setCookie).toMatch(/SameSite=Lax/i);
  await page.goto("/admin");
  await page.getByRole("link", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("public booking refreshes the chosen slot and accepts optional notes", async ({ page }) => {
  await page.goto("/agenda/oficio-barber?date=2026-12-01");
  const occupiedBefore = await page.locator(".modern-slot.occupied").count();
  await page.getByRole("button", { name: /Selecionar/ }).first().click();
  await page.getByLabel("Nome").fill("Cliente Fluxo");
  await page.getByLabel("Telefone").fill("11666666666");
  await page.getByRole("button", { name: "Confirmar reserva" }).click();
  await expect(page.getByText("Sua cadeira está reservada. Até lá!")).toBeVisible();
  await expect(page.locator(".modern-slot.occupied")).toHaveCount(occupiedBefore + 1);
});
