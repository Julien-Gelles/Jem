FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install
# ngrok nécessaire pour le `--tunnel`
RUN npm install --global @expo/ngrok@^4.1.0

COPY . .

# On expose les ports utilisés par Expo
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

CMD ["npx", "expo", "start", "--tunnel", "-c"]
