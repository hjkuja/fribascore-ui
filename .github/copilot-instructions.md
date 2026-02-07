# Project Guidelines

## Code Style

- **TypeScript Configuration**: Strict mode enabled with no unused locals/parameters (`tsconfig.app.json`). Target ES2022, JSX transform to `react-jsx`.
- **Linting**: ESLint with recommended JS/TS rules, React hooks, and Vite refresh plugins (`eslint.config.js`). Run `bun lint` to check.
- **Component Patterns**: Functional components with explicit prop interfaces (e.g., `CourseDetailsProps` in `CourseDetails.tsx`). PascalCase naming for components and files.
- **Styling**: Separate CSS files per component (e.g., `CourseDetails.css` imported in `CourseDetails.tsx`). Use semantic class names like `course-details__name`.
- **Accessibility**: Include ARIA labels on interactive elements (e.g., `aria-label` on tables and articles in `CourseDetails.tsx`).

## Architecture

- **Framework**: React 19 functional components with hooks. Entry point via `main.tsx` with `StrictMode` and `BrowserRouter`.
- **Build Tool**: Vite with React plugin and Babel for React Compiler (`vite.config.ts`).
- **Routing**: React Router DOM for nested routes under `AppLayout` (`AppRoutes.tsx`). Pages in `src/pages/`, components in `src/components/`.
- **Data Types**: TypeScript interfaces in `src/types/` (e.g., `Course` and `Hole` in `course.ts`). Dummy data in `src/data/dummyCourses.ts`.
- **Component Structure**: Reusable components in subfolders with `.tsx` and `.css` (e.g., `CourseList/CourseList.tsx`).

## Build and Test

- **Development**: `bun dev` starts Vite dev server with host binding (`package.json`).
- **Build**: `bun run build` compiles TypeScript and bundles with Vite (`package.json`).
- **Linting**: `bun lint` runs ESLint on the project (`package.json`).
  - Use this to find potential errors.
- **Preview**: `bun preview` serves built app locally (`package.json`).
- **Testing**: No test scripts or frameworks configured (e.g., no Jest or Vitest in `package.json`).

## Project Conventions

- **File Organization**: `src/app/` for core app logic (`App.tsx`, `AppRoutes.tsx`), `src/components/` for UI components, `src/pages/` for route handlers, `src/types/` for type definitions.
- **Imports**: Use `type` keyword for type-only imports (e.g., `import type { Course }` in `CourseDetails.tsx`).
- **Naming**: Components and types in PascalCase (e.g., `CourseDetails`, `Hole`). CSS classes use BEM-like naming (e.g., `course-details__name`).
- **Environment Variables**: Prefix with `VITE_` for client-side (e.g., `VITE_ALLOWED_HOST` in `vite.config.ts`).

## Integration Points

- **Server Configuration**: Vite dev server allows specific hosts including localhost and configurable extras via `ALLOWED_HOST` or `VITE_ALLOWED_HOST` env vars (`vite.config.ts`). Useful for development in different environments.