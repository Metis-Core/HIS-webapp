"use client";

import { useField } from "formik";
import type { IInputProps } from "@/interfaces";
import { Input } from "@/components";

type IFormInputProps = Omit<IInputProps, "error"> & { name: string };

export default function FormInput({ name, ...props }: IFormInputProps) {
  const [field, meta] = useField(name);

  return (
    <Input  {...field}  {...props} error={meta.touched && meta.error ? meta.error : undefined} />
  );
}
