import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("reasoning → save → reload → export and import", async ({ page }) => {
  await page.goto("/#/training/reasoning");
  await page.getByRole("combobox", { name: /라운드 수/ }).selectOption("1");
  await page
    .getByRole("button", { name: "정식 훈련 시작", exact: true })
    .click();
  for (const name of ["가람", "나래", "다온"])
    await page.getByRole("button", { name, exact: true }).click();
  await page.getByRole("button", { name: "정답 확인", exact: true }).click();
  await page.getByRole("button", { name: "결과 보기", exact: true }).click();
  await expect(
    page.getByText("기록이 이 브라우저에 저장되었습니다."),
  ).toBeVisible();
  await page.goto("/#/statistics");
  await page.reload();
  await page
    .getByRole("button", { name: "조건 누적 추론", exact: true })
    .click();
  await expect(
    page.getByText("완료한 정식 훈련 1회 · 중단 기록 0회"),
  ).toBeVisible();
  await page.goto("/#/settings");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSON 내보내기" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  await page.getByLabel("JSON 가져오기").setInputFiles(path!);
  await expect(page.getByText("복원할 데이터 확인")).toBeVisible();
  await page.getByRole("button", { name: "확인하고 복원" }).click();
  await expect(page.getByText("데이터를 복원했습니다.")).toBeVisible();
  await expect(page.getByText("훈련 기록 1개 · 학습 카드 0장")).toBeVisible();
});
test("practice does not create training records", async ({ page }) => {
  await page.goto("/#/training/reasoning");
  await page.getByRole("combobox", { name: /라운드 수/ }).selectOption("1");
  await page.getByRole("button", { name: "먼저 연습해 보기" }).click();
  for (const name of ["가람", "나래", "다온"])
    await page.getByRole("button", { name, exact: true }).click();
  await page.getByRole("button", { name: "정답 확인", exact: true }).click();
  await page.getByRole("button", { name: "결과 보기", exact: true }).click();
  await expect(
    page.getByText("연습을 마쳤습니다. 결과는 저장하지 않았습니다."),
  ).toBeVisible();
  await page.goto("/#/settings");
  await expect(page.getByText("훈련 기록 0개 · 학습 카드 0장")).toBeVisible();
});
test("dashboard accessibility and responsive overflow", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "오늘도, 나만의 속도로." }),
  ).toBeVisible();
  const violations = (
    await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze()
  ).violations;
  expect(violations).toEqual([]);
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

test("subject decks select real practice cards and preserve schedules", async ({
  page,
}) => {
  await page.goto("/#/training/spaced-repetition");
  await page.getByRole("combobox", { name: /저장할 묶음/ }).fill("자료구조");
  await page
    .getByRole("textbox", { name: "질문", exact: true })
    .fill("큐의 순서는?");
  await page.getByRole("textbox", { name: "정답", exact: true }).fill("FIFO");
  await page.getByRole("button", { name: "카드 추가", exact: true }).click();
  await expect(page.getByText("학습 카드를 저장했습니다.")).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: /훈련할 카드 묶음/ }),
  ).toHaveValue("자료구조");
  await page.getByRole("combobox", { name: /저장할 묶음/ }).fill("영어");
  await page
    .getByRole("textbox", { name: "질문", exact: true })
    .fill("영어 질문");
  await page
    .getByRole("textbox", { name: "정답", exact: true })
    .fill("영어 정답");
  await page.getByRole("button", { name: "카드 추가", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: /훈련할 카드 묶음/ }),
  ).toHaveValue("영어");
  await page
    .getByRole("combobox", { name: /훈련할 카드 묶음/ })
    .selectOption("자료구조");
  await expect(page.getByText("선택한 묶음 1장 · 오늘 복습 1장")).toBeVisible();
  await page
    .getByRole("button", { name: "먼저 연습해 보기", exact: true })
    .click();
  await expect(page.getByText("카드 1 / 1")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "큐의 순서는?" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "정답 확인", exact: true }).click();
  await page.getByRole("button", { name: /^기억함/ }).click();
  await expect(
    page.getByText("연습을 마쳤습니다. 결과는 저장하지 않았습니다."),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: /훈련할 카드 묶음/ }),
  ).toHaveValue("자료구조");
  await expect(page.getByText("선택한 묶음 1장 · 오늘 복습 1장")).toBeVisible();
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});
