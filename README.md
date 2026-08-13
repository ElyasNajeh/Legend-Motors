# Legend Motors

Legend Motors is a full-stack web application for a car showroom.  
It provides a public website for browsing available cars and an admin dashboard for managing cars, brands, sliders, and administrators.

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- Pydantic

### Frontend
- React
- Vite

### Infrastructure
- Docker
- Docker Compose
- Adminer

## Project Structure

```text
Legend-Motors/
│
├── LegendMotorsAPI/
│   ├── app/
│   │   ├── core/
│   │   ├── db/
│   │   ├── shared/
│   │   └── features/
│   │       ├── admins/
│   │       ├── auth/
│   │       ├── brands/
│   │       ├── cars/
│   │       ├── dashboard/
│   │       └── sliders/
│   ├── Dockerfile
│   └── requirements.txt
│
├── LegendMotorsUI/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .env
└── .env.example
```

## Main Features

- Admin authentication using access and refresh tokens
- HttpOnly cookie-based authentication
- Admin management
- Brand management
- Car management
- Normal and hybrid car support
- Multiple images per car
- Featured and active car management
- Slider management
- Dashboard statistics
- Image uploads
- Arabic and English car descriptions

## Database

The project uses PostgreSQL with the following main tables:

```text
admins
brands
cars
normal_cars
hybrid_cars
car_images
sliders
```

Cars share common information in the `cars` table, while type-specific information is stored separately in `normal_cars` and `hybrid_cars`.

## Environment Variables

Create a `.env` file in the project root using `.env.example`:


## Run with Docker

Build and start the complete project:

```bash
docker compose up --build
```

Run in detached mode:

```bash
docker compose up --build -d
```

Stop the project:

```bash
docker compose down
```

## Local Services

After starting Docker:

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| FastAPI | `http://localhost:8000` |
| Swagger API Docs | `http://localhost:8000/docs` |
| ReDoc | `http://localhost:8000/redoc` |
| Adminer | `http://localhost:8080` |
| PostgreSQL | `localhost:5432` |

## API Modules

The backend is organized by feature:

- Authentication
- Admins
- Brands
- Cars
- Sliders
- Dashboard

Interactive API documentation is available through Swagger at:

```text
http://localhost:8000/docs
```

## Docker Services

Docker Compose manages:

```text
postgres
adminer
api
ui
```