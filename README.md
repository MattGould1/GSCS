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