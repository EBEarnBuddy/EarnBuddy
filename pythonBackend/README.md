# Python Backend

This folder contains the FastAPI backend for the EarnBuddy project.

## Features

- User authentication (JWT)
- Pod and room management
- Chat/message APIs
- MongoDB integration

## Setup

1. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```

2. Run the server:
   ```sh
   uvicorn main:app --reload
   ```

3. Configure MongoDB connection in `database/mongo.py` if needed.

## Folder Structure

- `main.py` - FastAPI entrypoint
- `routes/` - API route definitions
- `models/` - Pydantic models
- `database/` - MongoDB connection

## Environment

- Python 3.9+
- FastAPI
- Motor (async MongoDB)
- Uvicorn