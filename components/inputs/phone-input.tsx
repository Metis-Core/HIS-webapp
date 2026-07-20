"use client";

import PhoneInputLib from "react-phone-number-input";
import "react-phone-number-input/style.css";
import type { IPhoneInputProps } from "@/interfaces";

export default function PhoneInput({
  value,
  onChange,
  label,
  error,
  disabled,
}: IPhoneInputProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-zinc-700">{label}</label>
      )}
      <PhoneInputLib
        international
        defaultCountry="UG"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`PhoneInput rounded-md border border-zinc-300 px-3 py-2 text-sm ${error ? "border-red-500" : ""}`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
