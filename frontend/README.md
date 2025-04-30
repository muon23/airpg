# Storytelling Editor Frontend

A modern web-based frontend for a storytelling and role-playing editor, built with React, TypeScript, and Material-UI.

## Features

- **Story Editor**: A powerful text editor for writing and editing stories
- **Character Manager**: Create and manage characters with custom attributes
- **World Builder**: Design and organize your story world with locations and connections

## Tech Stack

- React 18
- TypeScript
- Material-UI
- Monaco Editor (VS Code's editor)
- React Router
- Axios

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

### Building for Production

To create a production build:

```bash
npm run build
```

The build files will be in the `build` directory.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Main page components
├── hooks/         # Custom React hooks
├── services/      # API service functions
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
├── contexts/      # React context providers
└── assets/        # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 