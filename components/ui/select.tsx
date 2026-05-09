"use client";

import { Check, ChevronDown } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState, type SelectHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;
type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

function optionText(children: React.ReactNode) {
  return React.Children.toArray(children)
    .map((child) => (typeof child === "string" || typeof child === "number" ? String(child) : ""))
    .join("")
    .trim();
}

function readOptions(children: React.ReactNode): SelectOption[] {
  return React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement<React.OptionHTMLAttributes<HTMLOptionElement>>(child) || child.type !== "option") {
      return [];
    }

    return [{
      value: String(child.props.value ?? optionText(child.props.children)),
      label: optionText(child.props.children),
      disabled: child.props.disabled
    }];
  });
}

function dropdownStyle(rect: DOMRect): React.CSSProperties {
  const margin = 8;
  const width = Math.min(rect.width, window.innerWidth - margin * 2);
  const left = Math.min(Math.max(margin, rect.left), window.innerWidth - width - margin);
  const spaceBelow = window.innerHeight - rect.bottom - margin;
  const spaceAbove = rect.top - margin;
  const openUp = spaceBelow < 180 && spaceAbove > spaceBelow;
  const maxHeight = Math.max(120, Math.min(288, openUp ? spaceAbove - margin : spaceBelow - margin));
  const top = openUp ? Math.max(margin, rect.top - margin - maxHeight) : rect.bottom + margin;

  return { left, top, width, maxHeight };
}

export function Select({ className, children, value, defaultValue, onChange, disabled, name, id, required }: SelectProps) {
  const options = useMemo(() => readOptions(children), [children]);
  const [internalValue, setInternalValue] = useState(String(defaultValue ?? options[0]?.value ?? ""));
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentValue = value !== undefined ? String(value) : internalValue;
  const selected = options.find((option) => option.value === currentValue);
  const filtered = options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase().trim()));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function updateRect() {
      if (rootRef.current) setRect(rootRef.current.getBoundingClientRect());
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    }

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    document.addEventListener("pointerdown", onPointerDown);
    window.setTimeout(() => inputRef.current?.focus(), 0);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  function selectValue(nextValue: string) {
    const fakeEvent = { target: { value: nextValue, name }, currentTarget: { value: nextValue, name } } as React.ChangeEvent<HTMLSelectElement>;
    if (value === undefined) setInternalValue(nextValue);
    onChange?.(fakeEvent);
    setOpen(false);
    setQuery("");
  }

  function openList() {
    if (disabled) return;
    setRect(rootRef.current?.getBoundingClientRect() ?? null);
    setQuery("");
    setOpen(true);
  }

  return (
    <div ref={rootRef} className="relative min-w-0">
      {name ? <input type="hidden" name={name} value={currentValue} required={required} /> : null}
      <button
        type="button"
        id={id}
        disabled={disabled}
        className={cn(
          "group flex min-h-11 w-full min-w-0 items-center justify-between gap-2 overflow-hidden rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-left text-sm text-neutral-800 outline-none transition-colors hover:border-neutral-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400",
          open && "border-orange-400 ring-2 ring-orange-400/15",
          className
        )}
        onClick={() => (open ? setOpen(false) : openList())}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {open ? (
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
              if (event.key === "Enter" && filtered[0] && !filtered[0].disabled) selectValue(filtered[0].value);
            }}
            className="w-0 min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:ring-0"
            placeholder={selected?.label ?? "Cari pilihan..."}
          />
        ) : (
          <span className="min-w-0 truncate">{selected?.label ?? "Pilih"}</span>
        )}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-neutral-400 transition-transform group-hover:text-neutral-600", open && "rotate-180 text-orange-500")} />
      </button>

      {mounted && open && rect ? createPortal(
        <div
          ref={listRef}
          className="fixed z-[220] overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-card"
          style={dropdownStyle(rect)}
          role="listbox"
        >
          <div className="max-h-[inherit] overflow-y-auto">
            {filtered.length ? filtered.map((option) => {
              const active = option.value === currentValue;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  className={cn(
                    "flex min-h-10 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium outline-none transition-colors",
                    active ? "bg-orange-50 text-orange-700" : "text-neutral-700 hover:bg-neutral-50",
                    option.disabled && "cursor-not-allowed opacity-45"
                  )}
                  onClick={() => selectValue(option.value)}
                  role="option"
                  aria-selected={active}
                >
                  <span className="min-w-0 truncate">{option.label}</span>
                  {active ? <Check className="h-4 w-4 shrink-0" /> : null}
                </button>
              );
            }) : (
              <div className="px-3 py-4 text-center text-sm text-neutral-400">Tidak ada pilihan</div>
            )}
          </div>
        </div>,
        document.body
      ) : null}
    </div>
  );
}
