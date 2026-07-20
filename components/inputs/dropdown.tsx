"use client";
import Select from "react-select";
import type { StylesConfig } from "react-select";
import type { IOption, ISelectProps } from "@/interfaces";

const selectStyles: StylesConfig<IOption, boolean> = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? "var(--secondary)" : "var(--border)",
    boxShadow: state.isFocused ? "0 0 0 1px var(--secondary)" : "none",
    borderRadius: "0.375rem",
    minHeight: "38px",
    "&:hover": { borderColor: "var(--secondary)" },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "var(--primary)"
      : state.isFocused
        ? "var(--primary-soft)"
        : "transparent",
    color: state.isSelected ? "var(--primary-foreground)" : "var(--foreground)",
  }),
};

export default function Dropdown({
  options,
  value,
  onChange,
  label,
  error,
  isMulti,
  placeholder = "Select...",
  isDisabled,
}: ISelectProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <Select
        options={options}
        value={value}
        onChange={(val) => onChange((val as ISelectProps["value"]) ?? null)}
        isMulti={isMulti}
        placeholder={placeholder}
        isDisabled={isDisabled}
        classNamePrefix="rs"
        styles={selectStyles}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
