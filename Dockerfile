# 依赖Node
FROM node

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install cnpm
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org

# Bundle app source
COPY . /app
RUN cnpm install

EXPOSE 80
CMD [ "npm", "start" ]