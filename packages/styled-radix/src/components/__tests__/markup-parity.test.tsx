import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as Styled from "../..";

// Golden-baseline safety net for the styled-factory refactor: freezes the rendered
// markup, the export shape and the component display names of all 35 components.
// Snapshots are generated against the pre-refactor code and must never be updated
// (`-u`) while refactoring.

// useId output differs between runs / React versions — replace it with a stable token.
function normalizeIds(html: string): string {
    return html.replace(/(?:«|:|_)r_?[0-9a-z]+_?(?:»|:|_)/g, "ID");
}

function snapshotOf(node: ReactElement): string {
    const { container } = render(node);
    return `container: ${normalizeIds(container.innerHTML)}\nbody: ${normalizeIds(document.body.innerHTML)}`;
}

interface NamedLike {
    displayName?: string;
    name?: string;
    render?: { name?: string };
}

function nameOf(part: unknown): string {
    if (typeof part === "function") return part.name;
    const p = part as NamedLike;
    return p.displayName ?? p.render?.name ?? "<anonymous>";
}

function shapeOf(exported: unknown): unknown {
    if (typeof exported === "function") return { name: nameOf(exported) };
    if (typeof exported === "object" && exported !== null && !("$$typeof" in exported)) {
        return Object.fromEntries(
            Object.entries(exported as Record<string, unknown>).map(([key, value]) => [key, nameOf(value)]),
        );
    }
    return { name: nameOf(exported) };
}

afterEach(() => {
    vi.restoreAllMocks();
});

const {
    Accordion,
    AlertDialog,
    AspectRatio,
    Avatar,
    Breadcrumbs,
    Checkbox,
    Collapsible,
    Combobox,
    ContextMenu,
    Dialog,
    DropdownMenu,
    Form,
    HoverCard,
    Label,
    Menubar,
    NavigationMenu,
    OneTimePasswordField,
    Pagination,
    Popover,
    Portal,
    Progress,
    RadioGroup,
    ScrollArea,
    Select,
    Separator,
    Slider,
    Slot,
    Switch,
    Tabs,
    Toast,
    Toggle,
    ToggleGroup,
    Toolbar,
    Tooltip,
    VisuallyHidden,
} = Styled;

const SCENARIOS: Record<string, () => ReactElement> = {
    Accordion: () => (
        <Accordion.Root type="single" defaultValue="a" variant="outline">
            <Accordion.Item value="a">
                <Accordion.Header>
                    <Accordion.Trigger>Open</Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content>body</Accordion.Content>
            </Accordion.Item>
        </Accordion.Root>
    ),
    AlertDialog: () => (
        <AlertDialog.Root defaultOpen>
            <AlertDialog.Trigger>Open</AlertDialog.Trigger>
            <AlertDialog.Portal>
                <AlertDialog.Overlay />
                <AlertDialog.Content size="lg">
                    <AlertDialog.Title>Title</AlertDialog.Title>
                    <AlertDialog.Description>Desc</AlertDialog.Description>
                    <AlertDialog.Cancel>No</AlertDialog.Cancel>
                    <AlertDialog.Action variant="danger">Yes</AlertDialog.Action>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    ),
    AspectRatio: () => <AspectRatio ratio={16 / 9} className="custom" />,
    Avatar: () => (
        <Avatar.Root size="lg">
            <Avatar.Image src="/a.png" alt="a" />
            <Avatar.Fallback>JD</Avatar.Fallback>
        </Avatar.Root>
    ),
    Breadcrumbs: () => (
        <Breadcrumbs.Root separator="slash">
            <Breadcrumbs.List>
                <Breadcrumbs.Item>
                    <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
                </Breadcrumbs.Item>
                <Breadcrumbs.Separator />
                <Breadcrumbs.Item>
                    <Breadcrumbs.Page>Now</Breadcrumbs.Page>
                </Breadcrumbs.Item>
            </Breadcrumbs.List>
        </Breadcrumbs.Root>
    ),
    Checkbox: () => (
        <Checkbox.Root defaultChecked size="sm">
            <Checkbox.Indicator />
        </Checkbox.Root>
    ),
    Collapsible: () => (
        <Collapsible.Root defaultOpen>
            <Collapsible.Trigger>Toggle</Collapsible.Trigger>
            <Collapsible.Content>body</Collapsible.Content>
        </Collapsible.Root>
    ),
    Combobox: () => (
        <Combobox.Root defaultOpen>
            <Combobox.Anchor>
                <Combobox.Input size="sm" />
                <Combobox.Trigger>v</Combobox.Trigger>
            </Combobox.Anchor>
            <Combobox.Portal>
                <Combobox.Content>
                    <Combobox.Item value="a">A</Combobox.Item>
                </Combobox.Content>
            </Combobox.Portal>
        </Combobox.Root>
    ),
    ContextMenu: () => (
        <ContextMenu.Root>
            <ContextMenu.Trigger>Right click</ContextMenu.Trigger>
            <ContextMenu.Portal forceMount>
                <ContextMenu.Content forceMount>
                    <ContextMenu.Item>Item</ContextMenu.Item>
                    <ContextMenu.Sub>
                        <ContextMenu.SubTrigger>Sub</ContextMenu.SubTrigger>
                        <ContextMenu.SubContent forceMount>
                            <ContextMenu.Item>Nested</ContextMenu.Item>
                        </ContextMenu.SubContent>
                    </ContextMenu.Sub>
                </ContextMenu.Content>
            </ContextMenu.Portal>
        </ContextMenu.Root>
    ),
    Dialog: () => (
        <Dialog.Root defaultOpen>
            <Dialog.Trigger>Open</Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.Content size="xl">
                    <Dialog.Title>t</Dialog.Title>
                    <Dialog.Description>d</Dialog.Description>
                    <Dialog.Close>x</Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    ),
    DropdownMenu: () => (
        <DropdownMenu.Root defaultOpen>
            <DropdownMenu.Trigger>Menu</DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content>
                    <DropdownMenu.Label>Label</DropdownMenu.Label>
                    <DropdownMenu.Item>A</DropdownMenu.Item>
                    <DropdownMenu.CheckboxItem checked>
                        cb
                        <DropdownMenu.ItemIndicator>ok</DropdownMenu.ItemIndicator>
                    </DropdownMenu.CheckboxItem>
                    <DropdownMenu.Separator />
                    <DropdownMenu.RadioGroup value="a">
                        <DropdownMenu.RadioItem value="a">a</DropdownMenu.RadioItem>
                    </DropdownMenu.RadioGroup>
                    <DropdownMenu.Sub>
                        <DropdownMenu.SubTrigger>Sub</DropdownMenu.SubTrigger>
                        <DropdownMenu.SubContent forceMount>
                            <DropdownMenu.Item>Nested</DropdownMenu.Item>
                        </DropdownMenu.SubContent>
                    </DropdownMenu.Sub>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    ),
    Form: () => (
        <Form.Root>
            <Form.Field name="x" status="error">
                <Form.Label>x</Form.Label>
                <Form.Control />
                <Form.Message match="valueMissing">err</Form.Message>
            </Form.Field>
            <Form.Submit>go</Form.Submit>
        </Form.Root>
    ),
    HoverCard: () => (
        <HoverCard.Root defaultOpen>
            <HoverCard.Trigger>Hover</HoverCard.Trigger>
            <HoverCard.Portal>
                <HoverCard.Content>body</HoverCard.Content>
            </HoverCard.Portal>
        </HoverCard.Root>
    ),
    Label: () => (
        <>
            <Label htmlFor="email" className="custom">
                Email
            </Label>
            <input id="email" type="email" />
        </>
    ),
    Menubar: () => (
        <Menubar.Root defaultValue="file">
            <Menubar.Menu value="file">
                <Menubar.Trigger>File</Menubar.Trigger>
                <Menubar.Portal>
                    <Menubar.Content>
                        <Menubar.Label>Label</Menubar.Label>
                        <Menubar.Item>New</Menubar.Item>
                        <Menubar.CheckboxItem checked>
                            cb
                            <Menubar.ItemIndicator>ok</Menubar.ItemIndicator>
                        </Menubar.CheckboxItem>
                        <Menubar.Separator />
                        <Menubar.RadioGroup value="a">
                            <Menubar.RadioItem value="a">a</Menubar.RadioItem>
                        </Menubar.RadioGroup>
                        <Menubar.Sub>
                            <Menubar.SubTrigger>Sub</Menubar.SubTrigger>
                            <Menubar.SubContent forceMount>
                                <Menubar.Item>Nested</Menubar.Item>
                            </Menubar.SubContent>
                        </Menubar.Sub>
                    </Menubar.Content>
                </Menubar.Portal>
            </Menubar.Menu>
        </Menubar.Root>
    ),
    NavigationMenu: () => (
        <NavigationMenu.Root defaultValue="a">
            <NavigationMenu.List>
                <NavigationMenu.Item value="a">
                    <NavigationMenu.Trigger>More</NavigationMenu.Trigger>
                    <NavigationMenu.Content>
                        <NavigationMenu.Link href="/">Home</NavigationMenu.Link>
                    </NavigationMenu.Content>
                </NavigationMenu.Item>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    ),
    OneTimePasswordField: () => (
        <OneTimePasswordField.Root length={4}>
            <OneTimePasswordField.Input index={0} />
            <OneTimePasswordField.Input index={1} />
            <OneTimePasswordField.HiddenInput />
        </OneTimePasswordField.Root>
    ),
    Pagination: () => (
        <Pagination.Root size="sm">
            <Pagination.List>
                <Pagination.Item>
                    <Pagination.Previous />
                </Pagination.Item>
                <Pagination.Item>
                    <Pagination.Page page={1}>1</Pagination.Page>
                </Pagination.Item>
                <Pagination.Item>
                    <Pagination.Ellipsis />
                </Pagination.Item>
                <Pagination.Item>
                    <Pagination.Next />
                </Pagination.Item>
            </Pagination.List>
        </Pagination.Root>
    ),
    Popover: () => (
        <Popover.Root defaultOpen>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Anchor />
            <Popover.Portal>
                <Popover.Content>
                    body
                    <Popover.Close>x</Popover.Close>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    ),
    Portal: () => (
        <Portal>
            <span>portalled</span>
        </Portal>
    ),
    Progress: () => (
        <Progress.Root value={42} size="sm">
            <Progress.Indicator />
        </Progress.Root>
    ),
    RadioGroup: () => (
        <RadioGroup.Root defaultValue="a" aria-label="x" size="sm">
            <RadioGroup.Item value="a">
                <RadioGroup.Indicator />
            </RadioGroup.Item>
            <RadioGroup.Item value="b">
                <RadioGroup.Indicator />
            </RadioGroup.Item>
        </RadioGroup.Root>
    ),
    ScrollArea: () => (
        <ScrollArea.Root>
            <ScrollArea.Viewport>content</ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical" forceMount>
                <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
            <ScrollArea.Scrollbar orientation="horizontal" forceMount>
                <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner />
        </ScrollArea.Root>
    ),
    Select: () => (
        <Select.Root defaultOpen>
            <Select.Trigger size="sm">
                <Select.Value placeholder="Pick" />
            </Select.Trigger>
            <Select.Portal>
                <Select.Content>
                    <Select.ScrollUpButton />
                    <Select.Viewport>
                        <Select.Group>
                            <Select.Label>Group</Select.Label>
                            <Select.Item value="a">
                                <Select.ItemText>A</Select.ItemText>
                            </Select.Item>
                        </Select.Group>
                    </Select.Viewport>
                    <Select.ScrollDownButton />
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    ),
    Separator: () => <Separator orientation="vertical" className="custom" />,
    Slider: () => (
        <Slider.Root defaultValue={[20]} size="sm">
            <Slider.Track>
                <Slider.Range />
            </Slider.Track>
            <Slider.Thumb />
        </Slider.Root>
    ),
    Slot: () => (
        <Slot className="slotted">
            <span>child</span>
        </Slot>
    ),
    Switch: () => (
        <Switch.Root defaultChecked size="lg">
            <Switch.Thumb />
        </Switch.Root>
    ),
    Tabs: () => (
        <Tabs.Root defaultValue="a">
            <Tabs.List>
                <Tabs.Trigger value="a">A</Tabs.Trigger>
                <Tabs.Trigger value="b">B</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="a">A content</Tabs.Content>
            <Tabs.Content value="b">B content</Tabs.Content>
        </Tabs.Root>
    ),
    Toast: () => (
        <Toast.Provider>
            <Toast.Viewport />
            <Toast.Root open>
                <Toast.Title>Title</Toast.Title>
                <Toast.Description>Desc</Toast.Description>
                <Toast.Action altText="alt">Do</Toast.Action>
                <Toast.Close>x</Toast.Close>
            </Toast.Root>
        </Toast.Provider>
    ),
    Toggle: () => <Toggle size="sm" variant="outline" className="custom" />,
    ToggleGroup: () => (
        <ToggleGroup.Root type="single" size="sm" variant="outline">
            <ToggleGroup.Item value="a">A</ToggleGroup.Item>
        </ToggleGroup.Root>
    ),
    Toolbar: () => (
        <Toolbar.Root>
            <Toolbar.Button>B</Toolbar.Button>
            <Toolbar.Link href="/">L</Toolbar.Link>
            <Toolbar.Separator />
            <Toolbar.ToggleGroup type="single">
                <Toolbar.ToggleItem value="x">X</Toolbar.ToggleItem>
            </Toolbar.ToggleGroup>
        </Toolbar.Root>
    ),
    Tooltip: () => (
        <Tooltip.Provider>
            <Tooltip.Root defaultOpen>
                <Tooltip.Trigger>Hover</Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content>tip</Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    ),
    VisuallyHidden: () => <VisuallyHidden>hidden</VisuallyHidden>,
};

describe("markup parity — export shape (35 components)", () => {
    it("exposes exactly the expected public component names", () => {
        expect(Object.keys(SCENARIOS).sort()).toMatchSnapshot();
        for (const name of Object.keys(SCENARIOS)) {
            expect(Styled).toHaveProperty(name);
        }
    });

    it.each(Object.keys(SCENARIOS))("%s: keys and part display names are frozen", (name) => {
        expect(shapeOf((Styled as Record<string, unknown>)[name])).toMatchSnapshot();
    });
});

describe("markup parity — rendered HTML", () => {
    it.each(Object.keys(SCENARIOS))("%s: open/representative configuration", (name) => {
        const scenario = SCENARIOS[name];
        expect(scenario).toBeDefined();
        expect(snapshotOf(scenario())).toMatchSnapshot();
    });
});

describe("markup parity — boundary cases", () => {
    it("renders roots with no props and no children", () => {
        expect(snapshotOf(<Switch.Root />)).toMatchSnapshot();
        expect(snapshotOf(<Tabs.Root />)).toMatchSnapshot();
        expect(snapshotOf(<Accordion.Root type="single" />)).toMatchSnapshot();
        expect(snapshotOf(<Form.Root />)).toMatchSnapshot();
        expect(snapshotOf(<Toolbar.Root />)).toMatchSnapshot();
    });

    it("Tabs default variant and size are frozen (the only per-package difference)", () => {
        const { container } = render(<Tabs.Root data-testid="root" />);
        expect(container.querySelector('[data-testid="root"]')?.className).toMatchSnapshot();
    });

    it("consumer className and hostile attribute values are preserved verbatim", () => {
        const evil = '"><script>alert(1)</script>';
        const html = snapshotOf(<Separator className={evil} aria-label={evil} />);
        expect(document.body.querySelector("script")).toBeNull();
        expect(html).toMatchSnapshot();
    });
});

describe("markup parity — negative cases", () => {
    it("parts used outside their Root throw", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        expect(() => render(<Tabs.Trigger value="a">A</Tabs.Trigger>)).toThrow();
        expect(() => render(<Dialog.Close>x</Dialog.Close>)).toThrow();
        expect(() => render(<Accordion.Trigger>x</Accordion.Trigger>)).toThrow();
    });
});
