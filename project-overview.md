# Project Overview

## Introduction

This document provides an overview of the project's architecture and key components. It is intended to help developers understand the codebase and contribute effectively.

## File Structure

The project structure includes the following:

-   `.gitignore`: Specifies intentionally untracked files that Git should ignore.
-   `components.json`: Configuration file for UI components.
-   `eslint.config.js`: Configuration file for ESLint, a JavaScript linter.
-   `index.html`: The main HTML file for the application.
-   `package.json`: Contains metadata about the project, including dependencies and scripts.
-   `pnpm-lock.yaml`: Records the versions of dependencies used in the project.
-   `public/`: Directory for public assets.
-   `README.md`: Provides a description of the project.
-   `src/`: Directory containing the source code for the application.
    -   `index.css`: Contains the main CSS styles for the project, including:
        -   Imports for Tailwind CSS and tw-animate-css.
        -   A custom variant for dark mode.
        -   Global styles for the `root` element, including font, color scheme, and custom CSS variables.
-   `tsconfig.json`: Configuration file for TypeScript.
-   `tsconfig.node.json`: Configuration file for TypeScript for Node.js.
-   `vite.config.ts`: Configuration file for Vite, a build tool.

## Technologies Used

-   Tailwind CSS: A utility-first CSS framework.
-   tw-animate-css: A library for CSS animations.
-   TypeScript: A superset of JavaScript that adds static typing.
-   Vite: A build tool.
-   ESLint: A JavaScript linter.

## Key Concepts

-   **CSS Variables:** The project uses CSS variables (e.g., `--radius`, `--background`, `--foreground`) to define the color scheme and other style properties. These variables are defined using the `oklch` color format.
-   **Dark Mode:** The project supports dark mode using the `@custom-variant dark (&:is(.dark *))` selector.

## Further Information

To get a more complete understanding of the project, you may want to explore:

-   The project's JavaScript/TypeScript source code in the `src/` directory.
-   The configuration files for UI components, ESLint, TypeScript, and Vite.
-   The project's build process and deployment strategy.
