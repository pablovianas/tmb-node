FROM ghcr.io/puppeteer/puppeteer:23.3.0

USER root

# Defina as variáveis de ambiente
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

### install chrome
RUN apt-get update && apt-get install -y wget && apt-get install -y zip
RUN wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN apt-get install -y ./google-chrome-stable_current_amd64.deb

# Defina o diretório de trabalho
WORKDIR /usr/src/app

# Copie e instale as dependências
COPY package*.json ./
RUN npm ci

# Copie o restante do código da aplicação
COPY . .

# Comando padrão para iniciar a aplicação
CMD [ "node", "app.js" ]