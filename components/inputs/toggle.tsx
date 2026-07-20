"use client";
import type { IToggleProps } from "@/interfaces";

export default function Toggle({ checked, onChange, label, disabled, }: IToggleProps) {
    return (
        <label className="inline-flex cursor-pointer items-center gap-2">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={`relative h-6 w-11 rounded-full transition disabled:opacity-50 ${checked ? "bg-primary" : "bg-border"}`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "translate-x-5" : ""}`}
                />
            </button>
            {label && <span className="text-sm text-foreground">{label}</span>}
        </label>
    );
}