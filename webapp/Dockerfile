#FROM node:18.7.0 AS react-build
#
#WORKDIR /webapp
#
#COPY react/package.json react/tsconfig.json ./
#COPY react/src ./src
#COPY react/public ./public
#COPY react/scripts ./scripts
##COPY react .
#
#RUN npm install
##RUN chmod +x node_modules/.bin/react-scripts
#RUN npm run build


#FROM nginx:1.22.0
#COPY --from=react-build /webapp/build /usr/share/nginx/webapp
### copy prebuilt app
##COPY react/build /usr/share/nginx/webapp

FROM nginx:1.27.5
COPY react/build /usr/share/nginx/webapp
