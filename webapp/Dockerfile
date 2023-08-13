FROM node:18.7.0 AS react-build

WORKDIR /webapp

COPY react/package.json react/tsconfig.json ./
COPY react/src ./src
COPY react/public ./public
COPY react/scripts ./scripts
#COPY react .

RUN npm install
#RUN chmod +x node_modules/.bin/react-scripts
RUN npm run build

#ENTRYPOINT ["sleep", "3600"]


FROM nginx:1.22.0

COPY --from=react-build /webapp/build /usr/share/nginx/webapp
