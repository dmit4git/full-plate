FROM node:20.19.4 AS payload-build

ARG POSTGRES_PASSWORD

WORKDIR /
# install payload
RUN npx --yes create-payload-app@3.49.1 --name payload --template blank --db postgres --db-connection-string postgresql://payload_db_user:${POSTGRES_PASSWORD}@localhost:14432/payload_db
WORKDIR /payload
RUN npm install

# install OAuth2 plugin
RUN npm install next-auth@beta payload-authjs # install Auth.js and payload-authjs plugin
COPY payload/.env ./
COPY payload/src ./src
RUN npx --yes payload generate:importmap

# build payload
RUN npm install react-dom@19.1.0
RUN npm run build


FROM node:20.19.4
COPY --from=payload-build /payload /payload
WORKDIR /payload
CMD npm run start -- --port 14080
