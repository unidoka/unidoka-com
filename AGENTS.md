# Amorfa framework

## Files structure

```bash
/
├── server/
│   ├── ...
│   ├── env.example (.env vars especially for this repo)
│   ├── Dockerfile (Dockerfile for service)
│   └── docker-compose (separated logic if you want to make microservices)
├── website/
│   ├── ...
│   ├── env.example (.env vars especially for this repo)
│   ├── Dockerfile (Dockerfile for service)
│   └── docker-compose (separated logic if you want to make microservices)
├── env.example (common .env vars)
├── .gitignore
├── .repomixignore
├── docker-compose
└── README.md
```