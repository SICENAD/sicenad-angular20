import express from 'express';
import httpntlm from 'httpntlm';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

function loadProperties(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8').trim();
    if (!content) return {};

    // Si el archivo es JSON, parsearlo y devolver el objeto
    if (content.startsWith('{') || content.startsWith('[')) {
      try {
        const parsed = JSON.parse(content);
        return parsed || {};
      } catch (jsonErr) {
        console.warn(`Archivo properties parece JSON pero no se pudo parsear: ${jsonErr.message}. Intentando formato key=value...`);
      }
    }

    // Formato key=value (legacy)
    const lines = content.split(/\r?\n/);
    const obj = {};
    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('#') || line.startsWith(';')) continue;
      const idx = line.indexOf('=');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      obj[key] = val;
    }
    return obj;
  } catch (err) {
    console.warn(`No se pudo leer properties en ${filePath}: ${err.message}`);
    return {};
  }
}

// Ruta por defecto al archivo de propiedades (puedes cambiarla)
const propertiesPath = path.join(__dirname, 'public', 'properties.txt');
const props = loadProperties(propertiesPath);

const NTLM_USER = process.env.NTLM_USER || props.proxyUsername || props.user;
const NTLM_PASS = process.env.NTLM_PASS || props.proxyPassword || props.pass;
const NTLM_DOMAIN = process.env.NTLM_DOMAIN || props.proxyDomain || props.DOMAIN;

if (!NTLM_USER || !NTLM_PASS || !NTLM_DOMAIN) {
  console.error('Faltan credenciales NTLM. Configurar NTLM_USER/NTLM_PASS/NTLM_DOMAIN en variables de entorno o en public/properties.txt');
  process.exit(1);
}

// Proxy para SharePoint
app.use('/sharepoint', (req, res) => {
  const url = 'https://colabora.mdef.es/et/aclog/zonaprivada/sicenad' +
              req.originalUrl.replace(/^\/sharepoint/, '');
  console.log(`→ ${req.method} ${url}`);

  const ntlmConfig = {
    url,
    username: NTLM_USER,
    password: NTLM_PASS,
    workstation: '',
    domain: NTLM_DOMAIN,
    rejectUnauthorized: false,
    headers: { 'Accept': 'application/json;odata=verbose' }
  };

  if (req.method === 'GET') {
    httpntlm.get(ntlmConfig, (err, response) => {
      if (err) return res.status(500).send(err.message);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(response.statusCode).send(response.body.trim());
    });
    return;
  }

  if (req.method === 'POST') {
    // Obtener Digest
    httpntlm.post({
      ...ntlmConfig,
      url: 'https://colabora.mdef.es/et/aclog/zonaprivada/sicenad/_api/contextinfo',
      headers: { 'Accept': 'application/json;odata=verbose' }
    }, (err, digestRes) => {
      if (err) return res.status(500).send('Error al obtener digest: ' + err.message);
      const digest = JSON.parse(digestRes.body).d.GetContextWebInformation.FormDigestValue;
      const bodyStr = req.body ? JSON.stringify(req.body) : undefined;

      const headers = {
        'Accept': 'application/json;odata=verbose',
        'X-RequestDigest': digest,
      };
      if (bodyStr) headers['Content-Type'] = 'application/json;odata=verbose';
      if (req.headers['x-http-method']) headers['X-HTTP-Method'] = req.headers['x-http-method'];
      if (req.headers['if-match']) headers['IF-MATCH'] = req.headers['if-match'];

      httpntlm.post({
        ...ntlmConfig,
        url,
        headers,
        body: bodyStr
      }, (err2, response) => {
        if (err2) return res.status(500).send(err2.message);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.status(response.statusCode).send(response.body?.trim() || '');
      });
    });
    return;
  }

  res.status(405).send('Método no soportado');
});

app.listen(3000, () => console.log('Proxy NTLM corriendo en http://localhost:3000'));
