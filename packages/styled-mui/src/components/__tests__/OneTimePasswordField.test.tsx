import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OneTimePasswordField } from "../OneTimePasswordField";

describe("OneTimePasswordField (styled-mui)", () => {
    it("Root applies gmui-otp", () => {
        const { container } = render(
            <OneTimePasswordField.Root data-testid="root" maxLength={4}>
                <OneTimePasswordField.Input />
            </OneTimePasswordField.Root>,
        );
        expect(container.querySelector('[data-testid="root"]')).toHaveClass("gmui-otp");
    });

    it("Input applies gmui-otp__input", () => {
        const { container } = render(
            <OneTimePasswordField.Root maxLength={4}>
                <OneTimePasswordField.Input data-testid="input" />
            </OneTimePasswordField.Root>,
        );
        expect(container.querySelector('[data-testid="input"]')).toHaveClass("gmui-otp__input");
    });
});
