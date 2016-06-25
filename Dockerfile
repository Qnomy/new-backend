FROM nodesource/trusty:5.3.0

USER root

RUN apt-get update
RUN apt-get install -y libkrb5-dev

RUN npm install -g node-gyp
RUN npm install -g kafka-node --python=python2.7

# Create app directory
# Install app dependencies
WORKDIR /opt/app
ADD . /opt/app
RUN rm -rf /opt/app/node_modules
RUN npm install

#cp -a /tmp/node_modules /opt/app/

EXPOSE 3000

CMD [ "npm", "start" ]