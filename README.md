# Full-Plate
A fullstack project template. 
Demo available at [fullplate.dev](https://fullplate.dev).  
It is currently in prototype stage, only authentication and themes features work, there is no documentation very small test coverage.

## Tech Stack
 * **React** frontend, because it is most used ([stateofjs.com](https://2022.stateofjs.com/en-US/libraries/front-end-frameworks/)) and has the largest community 
 * **.Net Core 8.0** backend, because its performance is top tier ([techempower.com](https://www.techempower.com/benchmarks/#section=data-r21)) and it has one of the largest communities
 * **PostgreSQL** database 
 * **Nginx** web server / reverse proxy
 * **Graylog** centralized log management system

Documentation with details is coming soon.

## HowTo
### run on Linux
To run it on Linux, you need to clone the repository, go to docker compose directory and start its containers:
```
git clone https://github.com/dmit4git/full-plate.git
cd full-plate/compose
docker compose --profile frontend --profile backend up --build --detach
```
This will:
 * start PostgreSQL database container
 * build .Net Core WebApi backend container and start it
 * build React webapp and start Nginx container to serve it
   * Nginx will also forward all `/webapi` calls to the WebApi backend (port 10090)
 
Open it at [localhost](http://localhost).  
Stop containers to shut it down: `docker compose --profile frontend --profile backend down`

#### SSL
Letsencrypt [certbot](https://certbot.eff.org/) can be used to make new SSL certificate and periodically renew it.
  * run "frontend" service with nginx configured without ssl 
    * leave only one uncommented include directive `include /etc/nginx/conf.d/nginx.fullplate.nossl.conf.template;` in `nginx.conf`
    * run "frontend" docker service: `docker compose --profile frontend up --build --detach`
  * run "certbot" service that will make new certificate if it's not there yet and will be renewing it every 12 hours
    * `docker compose --profile certbot up --build --detach`
  * restart "frontend" service with nginx configured with ssl
    * run "frontend" docker service: `docker compose --profile frontend down`
    * leave only one uncommented include directive `include /etc/nginx/conf.d/nginx.fullplate.conf.template;` in `nginx.conf`
    * run "frontend" docker service: `docker compose --profile frontend up --build --detach` 

Alternatively, self-signed certificates can be used
  * run `nginx/certbot/selfsigned.sh` to generate following files in `nginx/certbot/selfsigned_certs`
    * personal certificate authority root certificate (`ca_root_cert.pem`)
    * certificate and key (`fullplate.local.crt, fullplate.local.key`) signed with your new root certificate for fullplate.local, www.fullplate.local and logs.fullplate.local
  * run "frontend" service with nginx configured with self-signed ssl
    * leave only one uncommented include directive `include /etc/nginx/conf.d/nginx.local.ssl.conf.template;` in `nginx.conf`
    * run "frontend" docker service: `docker compose --profile frontend up --build --detach`
  * add your root certificate to your browser as certificate authority
    * go to "Privacy and security" [settings](chrome://settings/certificates) in Chrome, select "Authorities" tab, click import, select generated ca_root_cert.pem, check all options on the form

### develop on Linux
[Install](https://learn.microsoft.com/en-us/dotnet/core/install/linux) .Net SDK locally to debug .Net code without dotnet container.

For development, use `dev` profile with `docker compose`:  
`docker compose --profile dev up --build --detach`
This will:
* start container with PostgreSQL database listening on default port 5432
  * start container with PostgreSQL test database listening on port 5433
* start Dozzle container to show containers logs at [localhost:8080](http://localhost:8080)
* start Nginx container to forward port 80 calls to port 3000 (default React dev server port)  
   * Nginx will also forward all `/webapi` calls to the WebApi backend (port 10090)

Run/debug .Net Core app in `webapi/NetCore/WebApi` with your IDE, it listens on port 10090 which Nginx forwards to.  
Start React development with `npm run start` in `webapp/react`, dev server listens on port 3000 which Nginx forwards to.  

Open it at [localhost](http://localhost).  
Or add `fullplate.local` domain to `/etc/hosts` for convenience:
 * `127.0.0.1       fullplate.local` - to access the app at [fullplate.local](http://fullplate.local)
 * `127.0.0.1       logs.fullplate.local` - to access Graylog at [logs.fullplate.local](http://logs.fullplate.local)

Stop containers to shut it down: `docker compose --profile dev down`

### Run Graylog on Linux
Docker services are configured to send logs to Graylog ([graylog.org](https://go2docs.graylog.org/5-0/what_is_graylog/what_is_graylog.htm)) instead of writing to local log file.  
You can run containerized Graylog stack with `docker compose`. Start in `full-plate` directory.
 * Only once, before starting Graylog for the first time, run setup script to prepare directories for persistent Graylog data:
   * go to graylog directory: `cd graylog`
   * add execution permission to the script: `chmod +x setup.sh`
   * run the script: `./setup.sh`
   * go back to full-plate directory: `cd ..`
 * run Graylog
   * go to compose directory: `cd compose`
   * start graylog services stack: `docker compose --profile graylog up --detach`
     * stop it when you want with: `docker compose --profile graylog down`
 * Only once, configure Graylog input to receive logs from docker compose services:
   * go to `localhost:9900/system/inputs`
     * or use `logs.fullplate.local/system/inputs` if you added the record to `/etc/hosts`
     * default credentials are user: `admin`, password: `admin`
   * add new `GELF UDP` input
     * select `GELF UDP` input, and click "Launch new input" button
     * give the new input a title, for example "GELF-UDP-input", scroll down, click "Launch input"

Graylog stack is independent of other services and can be started/stopped at any time.  

## Features
 * **authentication**: user can create new account. sign-in and sign-out
   * todo: wiki page with detailed feature description, dev docs, tests
     * backend test coverage is complete, frontend test are coming soon
 * **themes**: user can choose from variety of themes
   * todo: wiki page with detailed feature description, dev docs, tests
 * todo: **multi-language support**
 * todo: **health monitor**
