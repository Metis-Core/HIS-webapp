"use client";

import Image from "next/image";
import * as Yup from "yup";
import { Button, Form, FormInput } from "@/components";

const schema = Yup.object({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

export default function AuthPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/60 to-blue-50">
      <div className="grid w-full max-w-4xl min-h-[480px] grid-cols-2 overflow-hidden rounded-md bg-white shadow-xs">
        <div className="relative col-span-1">
          <Image
            src="/auth.jpg"
            alt="Medical supplies"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 flex flex-col justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-8">
            <p className="text-3xl font-semibold text-white">HIS</p>
            <p className="text-sm text-white/90">
              Secure access to patient records, clinical workflows, and care
              coordination.
            </p>
          </div>
        </div>

        <div className="col-span-1 flex flex-col justify-center gap-6 p-8">
          <div className="flex flex-col items-center gap-2 border-b border-slate-300 pb-6">
            <div className="flex items-center gap-2">
              <Image
                src="/logo2.png"
                alt="HIS logo"
                width={160}
                height={160}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <Form
            initialValues={{ username: "", password: "" }}
            validationSchema={schema}
            onSubmit={() => undefined}
            className="flex flex-col gap-4"
          >
            <FormInput
              name="username"
              label="Username"
              placeholder="Username"
              autoComplete="username"
              required
            />
            <FormInput
              name="password"
              type="password"
              label="Password"
              placeholder="********"
              autoComplete="current-password"
              required
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
