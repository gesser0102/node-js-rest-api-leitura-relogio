import express from 'express';
import { Routes } from './routes/routes';
import path from 'path';
import * as fs from 'fs';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const port = process.env.PORT;

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/temp/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    if (fs.existsSync(filePath)) {
      res.sendFile(filePath, err => {
        if (err) {
          console.error('Erro ao enviar o arquivo:', err);
          res.status(500).send('Erro ao enviar o arquivo');
        }
      });
    } else {
      res.status(404).send('Arquivo não encontrado');
    }
});

app.use('/', Routes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
