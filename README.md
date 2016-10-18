# GSCS #

## Requirements ##

Before installing the app check that you have -

* Node.js and Mongodb
* Gulp
* Nodemon or Foreverjs

## Running the app ##

Once downloaded please head into the client folder and run

```
#!cli

sudo npm install
```


```
#!cli

sudo gulp default
```
Now enter the server folder and run

```
#!cli

sudo npm install
```

The app should now have all of it dependencies and be ready to use.

Head into the / folder and run the following commands


```
#!cli

node client/client.js
node server/server.js
```
## Running the app forever ##

Install [foreverjs](https://github.com/foreverjs/forever)

Enter the / directory and run -

```
#!cli

forever start client/client.js
forever start server/server.js
```

The app will now run forever and run on startup



create mean 14.04 ubuntu droplet

git clone https://mattg12323@bitbucket.org/mattg12323/ewb.git

cd client

npm install

visit your ip/url (you should see some of the app)

gulp

install pm2

cd /client/ && pm2 start client.js

cd /server/ && pm2 start server.js

go to server-url/make-admin

log into app using admin admin

go to client-url/admin

create rooms and setup application as desired