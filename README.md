# Full-Plate
A fullstack project template. 
Demo available at [fullplate.dev](https://fullplate.dev).  
It is currently in prototype stage. Only authentication and themes features work, there is no documentation or tests coverage.

## Tech Stack
 * **React** frontend
 * **.Net Core 7.0** backend 
 * **PostgresQL** database 
 * **Nginx** web server / reverse proxy

Documentation with details is coming soon.

## HowTo
### run on Linux
To run it on Linux, you need to clone the repository, go to docker compose directory and start its containers:
```
git clone https://github.com/dmit4git/full-plate.git
cd full-plate/compose
docker compose --profile frontend --profile backend --build --detach
```
This will:
 * start PostgreSQL database container
 * build .Net Core webapi backend container and start it
 * build React webapp and start Nginx container to serve it
   * Nginx will also forward all `/webapi` calls to the webapi backend (port 10090)
 
Open it at [localhost](http://localhost).  
Stop containers to shut it down: `docker compose --profile frontend --profile backend down`

### develop on Linux
For development, use `dev` profile with `docker compose`:  
`docker compose --profile dev --build --detach`
This will:
* start PostgreSQL database container
* start Dozzle container to show containers logs at [localhost:8080](http://localhost:8080)
* start Nginx container to forward port 80 calls to port 3000 (default React dev server port)  
   * Nginx will also forward all `/webapi` calls to the webapi backend (port 10090)

Run/debug .Net Core app in `webapi/netcore` with your IDE, it listens on port 10090 which Nginx forwards to.  
Start React development with `npm run start` in `webapp/react`, dev server listens on port 3000 which Nginx forwards to.  
Open it at [localhost](http://localhost).  
Stop containers to shut it down: `docker compose --profile dev down`

## Features
 * **authentication**: user can create new account. sign-in and sign-out
   * todo: wiki page with detailed feature description, dev docs, tests
 * **themes**: user can choose from variety of themes
   * todo: wiki page with detailed feature description, dev docs, tests
 * todo: **multi-language support**
 * todo: **logs monitor**
 * todo: **health monitor**
