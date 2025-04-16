import { useState } from "react";
import {
  Form,
  useActionData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { verifyLogin } from "~/models/user.server";
import { createUserSession } from "~/utils/session.server";
import { LoginSchema, type LoginInput } from "~/utils/validation.server";

type ActionData = {
  errors?: {
    email?: string;
    password?: string;
  };
  values?: {
    email?: string;
  };
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

  // Validate form data
  const result = LoginSchema.safeParse({ email, password });

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;

    // Convert array errors to single string errors
    const errors: ActionData["errors"] = {};
    if (fieldErrors.email) errors.email = fieldErrors.email[0];
    if (fieldErrors.password) errors.password = fieldErrors.password[0];

    return json<ActionData>(
      {
        errors,
        values: { email },
      },
      { status: 400 }
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return json<ActionData>(
      {
        errors: {
          email: "Invalid email or password",
          password: "Invalid email or password",
        },
        values: { email },
      },
      { status: 400 }
    );
  }

  return createUserSession(user.id, redirectTo);
}

export default function Login() {
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const submit = useSubmit();

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#1a365d]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-300">
          Or{" "}
          <a
            href="/register"
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            create a new account
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form method="post" className="space-y-6">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  defaultValue={actionData?.values?.email}
                  className={`block w-full appearance-none rounded-md border ${
                    actionData?.errors?.email
                      ? "border-red-300"
                      : "border-gray-300"
                  } px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                />
                {actionData?.errors?.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {actionData.errors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`block w-full appearance-none rounded-md border ${
                    actionData?.errors?.password
                      ? "border-red-300"
                      : "border-gray-300"
                  } px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                />
                {actionData?.errors?.password && (
                  <p className="mt-2 text-sm text-red-600">
                    {actionData.errors.password}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign in
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
