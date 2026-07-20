"use client";
import { Formik, Form as FormikForm } from "formik";
import type { FormikConfig, FormikValues } from "formik";
import type { ReactNode } from "react";

export interface IFormProps<T extends FormikValues>
  extends Omit<FormikConfig<T>, "children"> {
  children: ReactNode;
  className?: string;
}

export default function Form<T extends FormikValues>({
  children,
  className,
  ...formikProps
}: IFormProps<T>) {
  return (
    <Formik {...formikProps}>
      <FormikForm className={className}>{children}</FormikForm>
    </Formik>
  );
}