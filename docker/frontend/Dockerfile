# ---------- Build ----------
FROM node:25-alpine AS build

WORKDIR /app

# Copiamos dependencias
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# Copiamos el resto del proyecto
COPY . .

# Build de producción
RUN npm run build


# ---------- Serve ----------
FROM nginx:alpine

# Eliminamos config por defecto
RUN rm /etc/nginx/conf.d/default.conf

# Copiamos nuestra config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos el build de Vite
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]