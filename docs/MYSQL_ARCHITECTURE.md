# MySQL architecture

The API is unchanged at the HTTP boundary, but its persistence layer uses MySQL through `mysql2/promise`.

## Tables

- `users`: patient and doctor accounts, hashed password, health profile JSON fields and reset token.
- `medical_records`: patient/doctor foreign keys, clinical notes and report BLOB metadata/content.
- `appointments`: patient and doctor foreign keys, appointment date/time and controlled status.
- `chat_messages`: ordered room messages and file metadata.

`server/config/db.js` creates these tables and their indexes/foreign keys on first connection. It supports Aiven TLS through `MYSQL_SSL=true` and `MYSQL_SSL_CA`.

## Deployment variables

Set `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_SSL=true`, `MYSQL_SSL_CA`, `MYSQL_CONNECTION_LIMIT`, `JWT_SECRET` and `FRONTEND_URL` in the deployment provider. Do not commit a populated `.env` file or the Aiven CA/private credentials.
