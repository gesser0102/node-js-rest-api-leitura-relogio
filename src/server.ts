import express from 'express';
import { Routes } from './routes/routes';
import path from 'path';
import * as fs from 'fs';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

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

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
