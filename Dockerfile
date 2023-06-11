FROM node:18.0.0 as build

WORKDIR /react-app

COPY client/package*.json .
RUN yarn install
COPY ./client/. .
COPY ./client/docker-local.env ./.env
RUN yarn run build
FROM nginx:1.23
#COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

COPY ./nginx/nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker-entrypoint.sh /

COPY --from=build /react-app/build /usr/share/nginx/html

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]