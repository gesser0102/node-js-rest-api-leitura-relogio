# NodeJS Rest API Integrate with Gemini AI

> Esta API permite o upload de uma imagem em string Base64 de relógios medidores de utilidades, como água e gás, utilizando a API Gemini Vision para extrair o valor contido no relógio.

## 💻 Pré-requisitos

Antes de começar, verifique se você atendeu aos seguintes requisitos:

- Node.JS
- Docker
- MySQL

## 🚀 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/gesser0102/node-js-rest-api-leitura-relogio.git
```
2. Navegue até a pasta do projeto:

```bash
cd node-js-rest-api-leitura-relogio
```
3. Instale as dependências:

```bash
npm install
```
4. Construa e execute o contêiner Docker:

```bash
docker-compose up --build
```

## ☕ Configurando as Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo .env:

```
GEMINI_API_KEY=<chave da API>

# Configurações do MySQL
DB_HOST=     # Host DB
DB_PORT=     # Porta padrão do MySQL
DB_USER=     # Usuário do banco de dados
DB_PASSWORD= # Senha do banco de dados
DB_NAME=     # Nome do banco de dados

# Porta do servidor da aplicação
PORT=3000
```

## 🌐 EndPoints

```
POST /upload 
 https://<base_url>/upload

Request Body 
{ 
"image": "<base64_string>", 
"customer_code": "string", 
"measure_datetime": "datetime", 
"measure_type": "WATER" ou "GAS"
} 

Responses:
- 200 :
 {
  "image_url": "string",
  "measure_value": integer,
  "measure_uuid": "string"
}

- 400:
 {  
  "error_code": "INVALID_DATA", 
  "error_description": <descrição do erro> 
 }

- 409
 {  
  "error_code": "DOUBLE_REPORT",  
  "error_description": "Leitura do mês já realizada"  
 } 
```

```
PATCH /confirm 
 https://<base_url>/confirm

Request Body 
{ 
 "measure_uuid": "string",
 "confirmed_value": integer
} 

Responses:
- 200 :
 {
  “success”: true
}

- 400:
 {  
  "error_code": "INVALID_DATA", 
  "error_description": <descrição do erro> 
 }

- 404
 {  
  "error_code": "MEASURE_NOT_FOUND",
  "error_description": "Leitura do mês já realizada"
}

- 409
 {  
   "error_code": "CONFIRMATION_DUPLICATE",
   "error_description": "Leitura do mês já realizada"
} 
```

```
GET /<customer code>/list

 https://<base_url>/<customer code>/list
 https://<base_url>/<customer code>/list?measure_type=WATER
 https://<base_url>/<customer code>/list?measure_type=GAS


Responses:
- 200 :
{ 
   “customer_code”: string, 
    “measures”: [ 
        { 
           “measure_uuid”: string, 
           “measure_datetime”: datetime, 
           “measure_type”: string, 
           “has_confirmed”:boolean, 
           “image_url”: string  
        }, 
        { 
           “measure_uuid”: string, 
           “measure_datetime”: datetime, 
           “measure_type”: string, 
           “has_confirmed”:boolean, 
          “image_url”: string 
        } 
    ] 
} 

- 400:
 {  
   "error_code": "INVALID_TYPE", 
    "error_description": “Tipo de medição não permitida”
 }

- 404
 {  
    "error_code": "MEASURES_NOT_FOUND",  
    "error_description": "Nenhuma leitura encontrada"
 } 
```

