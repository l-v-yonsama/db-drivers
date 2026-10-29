FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server.js fixture.proto ./
COPY includes ./includes
COPY certs ./certs
EXPOSE 50051 50052
CMD ["node", "server.js"]
