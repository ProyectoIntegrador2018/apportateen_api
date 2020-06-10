# Deployment

## API Deployment

1. You need to be a user of [Apportateen API github repo](https://github.com/ProyectoIntegrador2018/apportateen_api). 

2. Go to the [API directory](https://github.com/ProyectoIntegrador2018/apportateen_api).

``` bash
$ cd apportateen_api
```

3. Install the Heroku CLI

Download and install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-command-line).

4. If you haven't already, log in to your Heroku account and follow the prompts to create a new SSH public key.

``` bash
$ heroku login
```

5. Use Git to add apportateen-v2's source code to your local machine.

``` bash
$ heroku git:remote -a apportateen-v2
```

6. Deploy your changes

Make some changes to the code you just cloned and deploy them to Heroku using Git.

``` bash
$ git add .

$ git commit -am "make it better"

$ git push heroku master
```

