FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

ENV U2NET_HOME=/app/models

# Bundle the background-removal model so uploads never depend on runtime downloads.
RUN python -c "from rembg import new_session; new_session('u2net')"

COPY . .

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
