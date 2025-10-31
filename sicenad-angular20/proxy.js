import express from 'express';
import httpntlm from 'httpntlm';

const app = express();
app.use(express.json());

// Proxy para SharePoint
app.use('/sharepoint', (req, res) => {
  const url = 'https://colabora.mdef.es/et/aclog/zonaprivada/sicenad' +
              req.originalUrl.replace(/^\/sharepoint/, '');
  console.log(`→ ${req.method} ${url}`);

  const ntlmConfig = {
    url,
    username: 'jpueala',
    password: 'Aclogoctubre.2025',
    workstation: '',
    domain: 'mdef',
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
