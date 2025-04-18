import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  unstable_parseMultipartFormData,
  unstable_createMemoryUploadHandler,
  redirect,
} from "@remix-run/node";
import {
  useLoaderData,
  useActionData,
  Form,
  useNavigation,
} from "@remix-run/react";
import { requireUser } from "~/utils/session.server";
import { storeDocument } from "~/services/document.server";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

type ActionData =
  | { error: string; success?: never; fileName?: never; fileSize?: never }
  | { error?: never; success: true; fileName: string; fileSize: number };

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);

  return json({ user });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);

  if (!user) {
    console.error("No user found");
    return json<ActionData>(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    console.log("Starting file upload process");
    const uploadHandler = unstable_createMemoryUploadHandler({
      maxPartSize: 5_000_000, // 5MB limit
      filter: ({ contentType }) => {
        console.log("File content type:", contentType);
        const isValidType = contentType.includes(
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        if (!isValidType) {
          console.log("Invalid file type:", contentType);
        }
        return isValidType;
      },
    });

    console.log("Parsing form data");
    const formData = await unstable_parseMultipartFormData(
      request,
      uploadHandler
    );
    const file = formData.get("document") as File | null;

    if (!file) {
      console.log("No file received in form data");
      return json<ActionData>({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("Received file:", file.name, "Size:", file.size);

    // Store the document and get metadata
    console.log("Storing document");
    const metadata = await storeDocument(file, user.id.toString());
    console.log("File stored with ID:", metadata.id);

    // Redirect to the editor
    const redirectUrl = `/documents/edit/${metadata.id}`;
    console.log("Redirecting to:", redirectUrl);
    return redirect(redirectUrl);
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process file";
    console.error("Error message:", errorMessage);
    return json<ActionData>({ error: errorMessage }, { status: 500 });
  }
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const displayName = user?.display_name ? `, ${user.display_name}` : "";
  const [fileName, setFileName] = useState<string>("");
  const isUploading = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-[#1a365d]">
      <header className="bg-white/10 shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              DocPET
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">
                Welcome{displayName}
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
            {/* Main Import Section */}
            <div className="mb-8 overflow-hidden rounded-lg bg-white/10 shadow backdrop-blur-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Import Documents
              </h2>
              <p className="text-gray-300 mb-6">Upload your DOCX files.</p>

              {actionData && "error" in actionData && (
                <div className="mb-4 p-4 bg-red-500/20 text-red-200 rounded-md">
                  {actionData.error}
                </div>
              )}

              {actionData && "success" in actionData && (
                <div className="mb-4 p-4 bg-green-500/20 text-green-200 rounded-md">
                  File "{actionData.fileName}" uploaded successfully!
                  Redirecting to editor...
                </div>
              )}

              <Form
                method="post"
                encType="multipart/form-data"
                className="flex flex-col items-center gap-4"
              >
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                    isUploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  {isUploading
                    ? "Uploading..."
                    : fileName || "Choose DOCX File"}
                </label>
                <input
                  id="file-upload"
                  name="document"
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setFileName(file?.name || "");
                    console.log("File selected:", file?.name);
                  }}
                  disabled={isUploading}
                />
                {fileName && !isUploading && (
                  <button
                    type="submit"
                    className="mt-4 inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                  >
                    Process Document
                  </button>
                )}
              </Form>

              {isUploading && (
                <div className="mt-4 text-sm text-gray-300">
                  Uploading and processing your document...
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Processed Documents */}
              <div className="overflow-hidden rounded-lg bg-white/10 shadow backdrop-blur-sm">
                <div className="p-6">
                  <h3 className="text-lg font-medium leading-6 text-white flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Processed Documents
                  </h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-300">
                    <p>
                      View and manage your processed documents. Download
                      modified versions or apply additional changes.
                    </p>
                  </div>
                  <div className="mt-5">
                    <a
                      href="/documents"
                      className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      View Documents
                    </a>
                  </div>
                </div>
              </div>

              {/* Document Types / Templates */}
              <div className="overflow-hidden rounded-lg bg-white/10 shadow backdrop-blur-sm">
                <div className="p-6">
                  <h3 className="text-lg font-medium leading-6 text-white flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                      />
                    </svg>
                    Document Templates
                  </h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-300">
                    <p>
                      Create and manage document templates for common
                      modifications. Save patterns for quick processing.
                    </p>
                  </div>
                  <div className="mt-5">
                    <a
                      href="/documents/templates"
                      className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Manage Templates
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
