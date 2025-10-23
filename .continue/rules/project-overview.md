---
name: Project Overview
 description: Provides a high-level overview of the project's purpose, technologies, and structure. 
 alwaysApply: true
---

# Project Overview

This project, named `asace-hangout-registration`, is a React application built with TypeScript and Vite, designed to register members for a get-together. It features a single-page website with a form to collect user details (Full name, Date of Birth, Gender, Hobbies), a payment modal, and file upload functionality for payment proof.

## Key Technologies

- **React:** A JavaScript library for building user interfaces.
- **TypeScript:** A superset of JavaScript that adds static typing.
- **Vite:** A build tool that provides fast development and optimized builds.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **ShadCN UI:** A collection of pre-built, accessible UI components built with Radix UI and styled with Tailwind CSS.
- **React Hook Form & Zod:** Used for form management and validation.
- **clsx and tailwind-merge**: Utilities for constructing class names.
- **lucide-react**: Icon library.
- **tw-animate-css**: CSS animations

## Folder Structure and Key Modules

Based on the provided information, the project structure includes:

- `src/`: Contains the source code for the application.
  - `App.tsx`: The main application component.
  - `index.css`: Global CSS file, importing Tailwind CSS and `tw-animate-css`.
  - `components/`: This directory is expected to contain reusable UI components
  - `lib/`: Contains utility files and schema definitions

## Naming Conventions and Architectural Decisions

- The project uses TypeScript for type safety and maintainability.
- Tailwind CSS is used for styling, promoting a utility-first approach.
- ShadCN UI components provide a consistent and accessible user interface.
- React Hook Form and Zod are used for efficient form management and validation.

## Build Tools and Special Libraries

- **Vite:** Used for development and building the application.
- **ESLint:** Used for linting the code (configured with recommended and type-aware rules).
- **tw-animate-css:** Used for CSS animations.

This overview provides the AI with a foundational understanding of the project's purpose, technologies, and structure, enabling it to better assist with code generation, modification, and debugging.


🪜 Implementation Phases
Phase 1 – Core

Build form + modal + file upload

Save to Supabase (status: pending)

Phase 2 – Admin Workflow

Create a small /admin page (simple login, or Supabase row-level policy)

Show list of submissions

Buttons to “Approve” / “Reject”

Phase 3 – Notification

On approval → send email with WhatsApp group link

On rejection → optional message “Your receipt could not be verified”