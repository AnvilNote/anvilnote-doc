import { describe, expect, it } from "vitest";
import en from "../../../i18n/en.json";
import ja from "../../../i18n/ja.json";
import ko from "../../../i18n/ko.json";
import ru from "../../../i18n/ru.json";
import th from "../../../i18n/th.json";
import zhTW from "../../../i18n/zh-TW.json";

const messages = { en, "zh-TW": zhTW, ja, ko, ru, th };

describe("landing footer copy", () => {
  it("provides legal link labels in every supported locale", () => {
    for (const [locale, message] of Object.entries(messages)) {
      for (const key of ["privacy", "terms"] as const) {
        expect(message.landing.footer[key], `${locale} footer ${key} label`).toEqual(
          expect.any(String),
        );
        expect(message.landing.footer[key].trim(), `${locale} footer ${key} label`).not.toBe("");
      }
    }
  });
});
