FROM node:12

WORKDIR /usr/app
COPY . /usr/app
RUN yarn install
RUN yarn build
CMD yarn start