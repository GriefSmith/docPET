# DocPET - Document Processing and Editing Tool

DocPET is a minimalistic web application for Microsoft Word document handling and creation, designed specifically for notary workers. It provides a secure environment for creating, importing, and editing various document types like deeds and certificates.

## Features

- **Secure Authentication**: User login and session management for secure access
- **Document Management**: Create, import, and edit various document types
- **Template System**: Use templates with repetitive fields for efficient document creation
- **Form-Based Document Creation**: Fill in forms to generate documents with known values
- **Seamless MS Word Integration**: Easy transition between the web app and local MS Word

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/docpet.git
   cd docpet
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

- `app/` - Main application code
  - `routes/` - Application routes
  - `models/` - Data models
  - `utils/` - Utility functions
  - `db/` - Database setup
  - `styles/` - CSS styles

## Authentication

The application uses a secure authentication system with:

- Password hashing with bcrypt
- Session management with cookies
- Protected routes that require authentication

## Document Handling

DocPET supports:

- Creating new documents from templates
- Importing existing documents
- Editing documents with a form-based interface
- Exporting documents for use in MS Word

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Remix](https://remix.run/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Document handling with [docx](https://github.com/dolanmiu/docx) and [docxtemplater](https://github.com/edi9999/docxtemplater)
