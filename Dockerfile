FROM node:16.15.0-bullseye-slim as website
ENV HOST 0.0.0.0
ENV NUXT_TELEMETRY_DISABLED 1
RUN mkdir -p /website
WORKDIR /website
RUN apt-get update && \
    apt-get -y install libjemalloc-dev  && \
    echo "/usr/lib/x86_64-linux-gnu/libjemalloc.so" >> /etc/ld.so.preload && \
    apt-get clean && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN --mount=type=secret,id=npmrc,target=.npmrc npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
