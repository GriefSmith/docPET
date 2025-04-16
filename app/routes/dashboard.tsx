import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);

  return json({ user });
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-[#1a365d]">
      <header className="bg-white/10 shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">
                Welcome{user.display_name ? `, ${user.display_name}` : ""}
              </span>
              <form action="/logout" method="post">
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Create Document */}
              <div className="overflow-hidden rounded-lg bg-white/10 shadow backdrop-blur-sm">
                <div className="p-6">
                  <h3 className="text-lg font-medium leading-6 text-white">
                    Create Document
                  </h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-300">
                    <p>Create a new document from a template.</p>
                  </div>
                  <div className="mt-5">
                    <a
                      href="/documents/create"
                      className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Create New Document
                    </a>
                  </div>
                </div>
              </div>

              {/* My Documents */}
              <div className="overflow-hidden rounded-lg bg-white/10 shadow backdrop-blur-sm">
                <div className="p-6">
                  <h3 className="text-lg font-medium leading-6 text-white">
                    My Documents
                  </h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-300">
                    <p>View and manage your documents.</p>
                  </div>
                  <div className="mt-5">
                    <a
                      href="/documents"
                      className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      View My Documents
                    </a>
                  </div>
                </div>
              </div>

              {/* Document Types */}
              <div className="overflow-hidden rounded-lg bg-white/10 shadow backdrop-blur-sm">
                <div className="p-6">
                  <h3 className="text-lg font-medium leading-6 text-white">
                    Document Types
                  </h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-300">
                    <p>Manage your document types and templates.</p>
                  </div>
                  <div className="mt-5">
                    <a
                      href="/documents/types"
                      className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      View Document Types
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
