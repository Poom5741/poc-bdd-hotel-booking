FROM mcr.microsoft.com/playwright:v1.45.0-jammy

WORKDIR /tests
COPY tests/e2e/package.json tests/e2e/package-lock.json ./
RUN npm ci

COPY tests/e2e ./

ENV BASE_URL=http://host.docker.internal:3000
CMD ["npm", "test"]
