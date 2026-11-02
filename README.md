Pulse Fitness 💪

A modern fitness platform built with React, Tailwind CSS, Node.js, and PostgreSQL.

🌐 Live Demo: https://my-pulse-fitness.vercel.app/

📌 About the Project

Pulse Fitness started as a fitness website and evolved into a full-stack web application.

The project focuses on transforming a frontend website into a functional platform by adding a backend, database, user authentication, membership management, and online payments.

It was developed in several stages:

Frontend Development: Evolved the website using JavaScript, React, and Tailwind CSS, with reusable components and responsive layouts.

Backend & Database: Built a REST API with Node.js and Express, connected it to a Neon PostgreSQL database, and implemented user authentication.

Deployment: Deployed the application using Vercel and Neon PostgreSQL.

Payment Integration: Integrated Stripe Checkout in test mode to simulate secure membership payments.

🚀 Main Features

Responsive fitness website.

User registration and login.

Secure password hashing.

Membership plans and subscription management.

Class and trainer information.

User dashboard and booking management.

Stripe Checkout integration (test mode).

Membership activation after successful payment.

🛠️ Technologies Used

Area

Technologies

Frontend

React, JavaScript, Vite

Styling

Tailwind CSS

Backend

Node.js, Express.js

Database

PostgreSQL (Neon)

Authentication

Express Sessions, bcrypt

Payments

Stripe Checkout (Test Mode)

Deployment

Vercel

🏗️ Project Architecture

The application is organized into three main parts:

Client: React + Vite — handles the user interface, pages, forms, and interactions.

Server: Node.js + Express — handles authentication, API requests, membership management, and payments.

Database: Neon PostgreSQL — stores users, membership plans, bookings, and payment orders.

💳 Payment Flow

Stripe Checkout is integrated in test mode.

The user selects a membership plan.

The backend creates a pending order.

The user is redirected to Stripe Checkout.

Stripe processes the test payment.

After successful payment confirmation through a webhook, the order is marked as paid and the membership is activated.

Note: Payments are in Stripe test mode. No real money is charged.

🌍 Live Demo

Try the application here:

👉 Pulse Fitness – Live Demo

👨‍💻 Developer

Developed as a full-stack learning project to practice modern frontend development, backend APIs, database integration, authentication, deployment, and payment processing.