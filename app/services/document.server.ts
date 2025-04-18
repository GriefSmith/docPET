import { createHash } from "crypto";
import { writeFile, readFile, mkdir, access } from "fs/promises";
import { join } from "path";
import mammoth from "mammoth";

const TEMP_DIR = join(process.cwd(), "tmp", "documents");

// Ensure temp directory exists
async function ensureTempDir() {
  try {
    await access(TEMP_DIR);
  } catch {
    console.log("Creating temp directory:", TEMP_DIR);
    await mkdir(TEMP_DIR, { recursive: true });
  }
}

interface DocumentMetadata {
  id: string;
  fileName: string;
  originalSize: number;
  uploadedAt: Date;
  userId: string;
}

export async function storeDocument(file: File, userId: string): Promise<DocumentMetadata> {
  await ensureTempDir();

  console.log("Starting to store document:", file.name);
  
  const buffer = Buffer.from(await file.arrayBuffer());
  console.log("File converted to buffer, size:", buffer.length);
  
  const id = createHash("sha256").update(buffer).digest("hex").slice(0, 32);
  const filePath = join(TEMP_DIR, `${id}.docx`);
  const metadataPath = join(TEMP_DIR, `${id}.meta.json`);
  
  console.log("Writing file to:", filePath);
  await writeFile(filePath, buffer);

  const metadata: DocumentMetadata = {
    id,
    fileName: file.name,
    originalSize: file.size,
    uploadedAt: new Date(),
    userId
  };

  console.log("Writing metadata to:", metadataPath);
  await writeFile(
    metadataPath,
    JSON.stringify(metadata, null, 2)
  );

  console.log("Document stored successfully with ID:", id);
  return metadata;
}

export async function getDocument(id: string): Promise<{
  metadata: DocumentMetadata;
  content: string;
} | null> {
  try {
    await ensureTempDir();
    
    const metadataPath = join(TEMP_DIR, `${id}.meta.json`);
    const docxPath = join(TEMP_DIR, `${id}.docx`);

    console.log("Attempting to read document:", id);
    console.log("Metadata path:", metadataPath);
    console.log("Document path:", docxPath);

    const [metadataBuffer, docxBuffer] = await Promise.all([
      readFile(metadataPath),
      readFile(docxPath)
    ]);

    const metadata = JSON.parse(metadataBuffer.toString()) as DocumentMetadata;
    console.log("Metadata loaded:", metadata);

    console.log("Extracting text from document");
    const result = await mammoth.extractRawText({ buffer: docxBuffer });
    console.log("Text extracted, length:", result.value.length);

    return {
      metadata,
      content: result.value
    };
  } catch (error) {
    console.error("Failed to get document:", error);
    return null;
  }
}

export async function processDocument(content: string): Promise<string> {
  // TODO: Implement gender-based text processing
  // For now, just return the original content
  console.log("Processing document content, length:", content.length);
  return content;
} 