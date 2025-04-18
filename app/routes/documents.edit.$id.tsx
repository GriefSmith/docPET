import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/utils/session.server";
import { getDocument, processDocument } from "~/services/document.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const { id } = params;

  if (!id) {
    throw new Response("Not Found", { status: 404 });
  }

  const doc = await getDocument(id);

  if (!doc) {
    throw new Response("Document not found", { status: 404 });
  }

  // Process the document content
  const processedContent = await processDocument(doc.content);

  return json({
    user,
    document: {
      id,
      name: doc.metadata.fileName,
      originalText: doc.content,
      processedText: processedContent,
    },
  });
}

export default function DocumentEditor() {
  const { document } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-[#1a365d]">
      <header className="bg-white/10 shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Edit Document: {document.name}
            </h1>
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="text-sm text-gray-300 hover:text-white"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6">
            {/* Original Text */}
            <div className="bg-white/10 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-white mb-4">
                Original Text
              </h2>
              <div className="bg-gray-900 rounded-lg p-4 h-[600px] overflow-y-auto">
                <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                  {document.originalText || "Loading original text..."}
                </pre>
              </div>
            </div>

            {/* Processed Text */}
            <div className="bg-white/10 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-white mb-4">
                Processed Text
              </h2>
              <div className="bg-gray-900 rounded-lg p-4 h-[600px] overflow-y-auto">
                <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                  {document.processedText || "Processing text..."}
                </pre>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Process Changes
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Download DOCX
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
