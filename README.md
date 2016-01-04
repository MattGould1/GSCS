# README #

Once meanstack is installed with all required files:

- navigate to ewb/server in your terminal and execute the following command:

nohup node server.js >/dev/null 2>&1 &

If successful you will receive an interger and server up message.

- now navigate to ewb/client and execute the following command:

nohup node client.js >/dev/null 2>&1 &

If successful you will receive a message listening on port 80.

- Now close you're terminal the system is up and running.

If for any reason you need to turn off the web app use the command:

killall node


Please note when booting you're server or rebooting the system the above commands will need to be executed. 

### What is this repository for? ###


### How do I get set up? ###

* Summary of set up
* Configuration
* Dependencies
* Database configuration
* How to run tests
* Deployment instructions

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin