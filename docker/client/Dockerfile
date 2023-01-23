FROM node:18.0.0 as build

WORKDIR /react-app

COPY client/package*.json .
RUN yarn install
COPY ./client/. .
COPY ./client/docker-local.env ./.env
RUN yarn run build
FROM nginx:1.19
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /react-app/build /usr/share/nginx/html