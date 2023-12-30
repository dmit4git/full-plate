# Full-Plate
A fullstack project template. 
Demo available at [fullplate.dev](https://fullplate.dev).  
It is currently in prototype stage, only authentication and themes features work, there is no documentation very small test coverage.

## Tech Stack
 * **React** frontend, because it is most used ([stateofjs.com](https://2022.stateofjs.com/en-US/libraries/front-end-frameworks/)) and has the largest community 
 * **.Net Core 8.0** backend, because its performance is top tier ([techempower.com](https://www.techempower.com/benchmarks/#section=data-r21)) and it has one of the largest communities
 * **PostgreSQL** database 
 * **Nginx** web server / reverse proxy

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
Stop containers to shut it down: `docker compose --profile dev down`

## Features
 * **authentication**: user can create new account. sign-in and sign-out
   * todo: wiki page with detailed feature description, dev docs, tests
     * backend test coverage is complete, frontend test are coming soon
 * **themes**: user can choose from variety of themes
   * todo: wiki page with detailed feature description, dev docs, tests
 * todo: **multi-language support**
 * todo: **logs monitor**
 * todo: **health monitor**
