import { env } from 'node:process';
import http from 'node:http';
import https from 'node:https';


const port = env.ENV == 'production' ? env.PORT : 3000;

const server = http.createServer((req, res) => {
    if (!req.headers['authorization'] || req.headers['authorization'] != env.STRAPI_TOKEN) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Invalid Authorization token.');
        return;
    }

    const postData = JSON.stringify({
        event_type: 'deploy-prod',
    });

    const postOptions = {
        host: 'api.github.com',
        port: '443',
        path: env.GITHUB_PATH,
        method: 'POST',
        headers: {
            'accept': 'application/vnd.github.v3+json',
            'authorization': env.GITHUB_TOKEN,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': req.headers['user-agent'],
        }
    };
        
    const GitHubRequest = https.request(postOptions, res => {
        res.setEncoding('utf8');
        res.on('data', chunk => {
            console.log('Response: ' + chunk);
        });
    });
    GitHubRequest.write(postData);
    GitHubRequest.on('error', console.error);
    GitHubRequest.end();


    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Request proxied.');
});

server.listen(port, () => {
    console.log(`Server running at ${port}/`);
});
