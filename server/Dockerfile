FROM node:22-slim

# Create app directory
WORKDIR /usr/src/app

# Install only production dependencies (copy package manifest first for better cache)
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --production

# Copy app sources
COPY . .

# Default port
ENV PORT=3001
EXPOSE 3001

# Use a non-root user where available (node exists in official images)
USER node

CMD ["node", "index.js"]
