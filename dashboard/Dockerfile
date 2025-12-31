# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json bun.lockb ./
RUN npm install -g bun
RUN bun install
COPY . .
RUN bun run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copie des fichiers de build depuis l'étape précédente
COPY --from=builder /app/dist /usr/share/nginx/html

# Copie de la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposition du port 8080
EXPOSE 8080

# Démarrage de Nginx
CMD ["nginx", "-g", "daemon off;"]