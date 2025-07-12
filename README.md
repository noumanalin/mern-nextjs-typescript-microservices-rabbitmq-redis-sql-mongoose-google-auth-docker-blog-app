# MERN Next.js TypeScript Microservices Blogging Application

A highly scalable blogging platform built with:

- MERN stack (MongoDB, Express.js, React/Next.js, Node.js)
- TypeScript
- Microservices Architecture
- RabbitMQ for message queueing
- Redis for caching
- SQL + Mongoose (dual-database integration)
- Google OAuth Authentication
- Fully Dockerized for containerized deployment





main/
├── docker-compose.yml  ✅
├── client/             🖥️ Next.js app
│   └── Dockerfile
└── services/
    ├── user/           🧑 Node.js + MongoDB
    │   └── Dockerfile
    ├── author/         ✍️ Node.js + PostgreSQL + RabbitMQ
    │   └── Dockerfile
    └── blog/           📝 Node.js + PostgreSQL + RabbitMQ
        └── Dockerfile
