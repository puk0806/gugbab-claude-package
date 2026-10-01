import * as Headless from "@gugbab/headless";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { DirectionProvider, Slider, useDirection } from "../../index";

function Horizontal({ children }: { children?: ReactNode }) {
    return (
        <>
            {children}
            <Slider.Root defaultValue={[50]}>
                <Slider.Track>
                    <Slider.Range />
                </Slider.Track>
                <Slider.Thumb aria-label="v" />
            </Slider.Root>
        </>
    );
}

function pressArrowLeft() {
    const thumb = screen.getByRole("slider");
    thumb.focus();
    fireEvent.keyDown(thumb, { key: "ArrowLeft" });
    return Number(thumb.getAttribute("aria-valuenow"));
}

describe("DirectionProvider re-export (styled-radix)", () => {
    it("헤드리스와 같은 Provider·훅 객체를 다시 내보낸다 (두 벌 설치 시 Context 불일치 방지)", () => {
        expect(DirectionProvider).toBe(Headless.DirectionProvider);
        expect(useDirection).toBe(Headless.useDirection);
    });

    it("styled 패키지에서 가져온 Provider로 RTL이 styled 컴포넌트에 전달된다", () => {
        render(
            <DirectionProvider dir="rtl">
                <Horizontal />
            </DirectionProvider>,
        );
        // RTL 가로 슬라이더: ArrowLeft = 증가
        expect(pressArrowLeft()).toBe(51);
    });

    it("Provider가 없으면 기본 ltr로 동작한다 (누락 경계)", () => {
        render(<Horizontal />);
        expect(pressArrowLeft()).toBe(49);
    });

    it("Provider 밖에서 useDirection을 호출해도 throw하지 않고 ltr을 준다 (오용)", () => {
        let dir: string | undefined;
        function Probe() {
            dir = useDirection();
            return null;
        }
        expect(() => render(<Probe />)).not.toThrow();
        expect(dir).toBe("ltr");
    });
});
