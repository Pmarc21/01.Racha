FROM node:25-alpine
WORKDIR /app
# Copiamos dependencias
COPY frontend/package.json ./
COPY frontend/package-lock.json ./
RUN npm install
COPY frontend .

EXPOSE 5173
CMD ["npm", "run", "dev"]