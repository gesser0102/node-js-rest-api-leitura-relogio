FROM node:18-alpine

WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar as dependências
RUN npm install

# Copiar o código-fonte
COPY . .

# Compilar o TypeScript para JavaScript
RUN npm run build

# Expor a porta da aplicação
EXPOSE ${PORT}

# Iniciar a aplicação com o código compilado
CMD ["npm", "start"]
