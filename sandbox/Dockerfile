FROM python:3.11-slim

RUN useradd -m -u 1000 sandbox

WORKDIR /app

RUN pip install --no-cache-dir numpy pandas scipy flask gunicorn

COPY runner/ ./runner/

RUN chown -R sandbox:sandbox /app

USER sandbox

EXPOSE 9000

CMD ["python", "runner/server.py"]
