FROM postgres:16

# Variables por defecto (se pueden sobreescribir desde docker-compose)
ENV POSTGRES_DB=racha \
    POSTGRES_USER=racha \
    POSTGRES_PASSWORD=racha

# Copiamos los scripts de inicialización
COPY init/ /docker-entrypoint-initdb.d/

# Puerto estándar
EXPOSE 5433
