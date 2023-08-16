# full-plate
A fullstack project template. 
Demo available at http://44.198.72.114/, [fullplate.dev](https://fullplate.dev) domain is coming up soon.  
It is currently in prototype stage. Basic features work, but there is no documentation or tests coverage.

## tech stack
 * **React** frontend
 * **.Net Core 7.0 webapi** backend 
 * **PostgresQL** database 
 * **nginx** web server / reverse-proxy

Wiki page with full description is coming soon.

## howto
To run it, you need to clone the repository, go to docker compose directory and start its containers:
```
git clone https://github.com/dmit4git/full-plate.git
cd full-plate/compose
docker compose up --build --detach
```
Open it at http://localhost.  
Stop containers to shut it down:
`docker compose down`

## features
 * **authentication**: user can create new account. sign-in and sign-out
   * todo: wiki page with detailed feature description, dev docs, tests
 * **themes**: user can choose from variety of themes, which apply instantly
   * todo: wiki page with detailed feature description, dev docs, tests
 * todo: **multi-language support**
 * todo: **logs monitor**
 * todo: **health monitor**
