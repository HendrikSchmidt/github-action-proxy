import { env } from 'node:process';
import http from 'node:http';
import https from 'node:https';


const hostname = env.ENV == 'production' ? env.PROXY_HOST : '127.0.0.1';
const port = env.ENV == 'production' ? env.PROXY_PORT : 3000;

const server = http.createServer((req, res) => {
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

server.listen(port, hostname, () => {
    console.log(`Server running at ${hostname}:${port}/`);
});
