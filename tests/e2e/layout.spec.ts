import { expect, test } from "@playwright/test";
import { LOCALE_PAGES, scrollThrough } from "./helpers";

const WIDTHS = [320, 360, 375, 414, 768, 834, 1024, 1280, 1440, 1920];

test.describe("вёрстка на всех ширинах (ТЗ §13)", () => {
  test("нет горизонтальной прокрутки и вылезающего текста — все языки, 320–1920", async ({
    page,
  }, info) => {
    test.skip(
      info.project.name !== "desktop",
      "ширины перебираем в одном проекте",
    );
    const problems: string[] = [];
    for (const loc of LOCALE_PAGES) {
      await page.goto(loc.path);
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.waitForTimeout(120);
        const found = await page.evaluate(() => {
          const out: string[] = [];
          const doc = document.documentElement;
          if (doc.scrollWidth > doc.clientWidth + 1)
            out.push(
              `страница шире экрана: ${doc.scrollWidth} > ${doc.clientWidth}`,
            );
          // Внутри горизонтальных лент и обрезающих контейнеров выход за край — норма
          const clipped = (el: Element) => {
            for (
              let p = el.parentElement;
              p && p !== document.body;
              p = p.parentElement
            ) {
              const o = getComputedStyle(p).overflowX;
              if (o !== "visible") return true;
            }
            return false;
          };
          for (const el of document.querySelectorAll(
            "h1, h2, h3, p, li, a, button, span",
          )) {
            if (!el.textContent?.trim() || clipped(el)) continue;
            const r = el.getBoundingClientRect();
            if (r.width === 0) continue;
            if (r.right > doc.clientWidth + 1 || r.left < -1) {
              out.push(
                `${el.tagName.toLowerCase()}.${(el as HTMLElement).className} «${el.textContent.trim().slice(0, 30)}» ${Math.round(r.left)}…${Math.round(r.right)}`,
              );
            }
          }
          return out;
        });
        for (const f of found) problems.push(`${loc.path} @${width}: ${f}`);
      }
    }
    expect(problems).toEqual([]);
  });

  test("текст Hero не закрывает лицо на фото", async ({ page }, info) => {
    // Экран проекта, а в проекте desktop ещё два крайних случая двух колонок:
    // узкий iPad в портрете (768) и начало компьютерной вёрстки в альбоме (1024)
    const sizes =
      info.project.name === "desktop"
        ? [null, { width: 768, height: 1024 }, { width: 1024, height: 768 }]
        : [null];
    for (const size of sizes) {
      if (size) await page.setViewportSize(size);
      for (const loc of LOCALE_PAGES) {
        await page.goto(loc.path);
        await page.waitForFunction(() => {
          const img =
            document.querySelector<HTMLImageElement>(".hero__media img");
          return !!img && img.complete && img.naturalWidth > 0;
        });
        await page.waitForTimeout(900); // анимация входа заголовка
        const overlaps = await page.evaluate(() => {
          const media = document.querySelector<HTMLElement>(".hero__media")!;
          const img = media.querySelector("img")!;
          const [fx, fy, fw, fh] = media.dataset
            .faceBox!.split(",")
            .map(Number);
          const box = img.getBoundingClientRect();
          const scale = Math.max(
            box.width / img.naturalWidth,
            box.height / img.naturalHeight,
          );
          const rw = img.naturalWidth * scale;
          const rh = img.naturalHeight * scale;
          const [px, py] = getComputedStyle(img)
            .objectPosition.split(" ")
            .map((v) => parseFloat(v) / 100);
          const left = box.left + (box.width - rw) * px;
          const top = box.top + (box.height - rh) * py;
          const face = {
            l: left + fx * rw,
            t: top + fy * rh,
            r: left + (fx + fw) * rw,
            b: top + (fy + fh) * rh,
          };
          const out: string[] = [];
          for (const el of document.querySelectorAll(
            ".hero__name, .hero__pill, .hero__captions",
          )) {
            const range = document.createRange();
            range.selectNodeContents(el);
            for (const r of range.getClientRects()) {
              if (r.width < 2) continue;
              const ix = Math.min(r.right, face.r) - Math.max(r.left, face.l);
              const iy = Math.min(r.bottom, face.b) - Math.max(r.top, face.t);
              if (ix > 2 && iy > 2)
                out.push(
                  `${(el as HTMLElement).className}: ${Math.round(ix)}×${Math.round(iy)}px`,
                );
            }
          }
          return out;
        });
        expect(
          overlaps,
          `${loc.path} ${size ? `${size.width}×${size.height}` : info.project.name}`,
        ).toEqual([]);
      }
    }
  });

  test("фото Hero занимает всю высоту первого экрана на компьютере", async ({
    page,
  }, info) => {
    test.skip(info.project.name !== "desktop", "правило для широкого экрана");
    await page.goto("/");
    const [hero, media] = await Promise.all([
      page.locator(".hero").boundingBox(),
      page.locator(".hero__media").boundingBox(),
    ]);
    expect(Math.abs(media!.y - hero!.y)).toBeLessThan(2);
    expect(
      Math.abs(media!.y + media!.height - (hero!.y + hero!.height)),
    ).toBeLessThan(2);
  });

  test("сдвиг вёрстки при загрузке (CLS) меньше 0.1", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);
    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let sum = 0;
          new PerformanceObserver((list) => {
            for (const e of list.getEntries() as Array<
              PerformanceEntry & { value: number; hadRecentInput: boolean }
            >) {
              if (!e.hadRecentInput) sum += e.value;
            }
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve(sum), 300);
        }),
    );
    expect(cls).toBeLessThan(0.1);
  });

  test("после прокрутки видны все блоки с появлением", async ({ page }) => {
    await page.goto("/");
    await scrollThrough(page);
    // Только отрисованные блоки: фото «Обо мне» на телефоне скрыто (правка Кати 01.11) — экрана не пересекает,
    // отметку появления не получит, и ждать её от него нечего. Повернут телефон — фото покажется и отметится.
    const hidden = await page
      .locator("[data-reveal]:not([data-in])")
      .evaluateAll((els) => els.filter((el) => el.getClientRects().length > 0).map((el) => el.className));
    expect(hidden).toEqual([]);
  });
});

test.describe("доступность движения и работа без JS", () => {
  test.use({ reducedMotion: "reduce" });

  test("при «уменьшить движение» всё видно сразу, без прокрутки", async ({
    page,
  }) => {
    await page.goto("/");
    const faded = await page
      .locator("[data-reveal]")
      .evaluateAll(
        (els) =>
          els.filter((el) => parseFloat(getComputedStyle(el).opacity) < 1)
            .length,
      );
    expect(faded).toBe(0);
  });
});

test.describe("без JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("страница читается целиком: все разделы и тексты на месте", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("main > section, main > nav")).toHaveCount(9);
    await expect(page.locator("h1")).toBeVisible();
    const faded = await page
      .locator("[data-reveal]")
      .evaluateAll(
        (els) =>
          els.filter((el) => parseFloat(getComputedStyle(el).opacity) < 1)
            .length,
      );
    expect(faded).toBe(0);
  });
});
