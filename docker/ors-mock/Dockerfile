FROM node:18-slim
WORKDIR /usr/src/app
COPY package.json .
RUN npm install --production
COPY index.js .
EXPOSE 8082
CMD ["node", "index.js"]
