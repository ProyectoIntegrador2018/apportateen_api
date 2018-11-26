
# Deployment

## API Deployment

1. You need to be a user of [Apportateen API github repo](https://github.com/ProyectoIntegrador2018/apportateen_api). 

2. Go to the [API directory](https://github.com/ProyectoIntegrador2018/apportateen_api).

``` bash
$ cd apportateen_api
```

3. Do a push to master.

Everytime you do a push to master on the API, it will automatically be deployed on Heroku.


## Frontend Deployment

1. To do the frontend deployment you need be logged in in Firebase. For this you also need access to the Firebase account. 

2. Go to the [frontend directory](https://github.com/ProyectoIntegrador2018/apportateen), and install the dependencies.

``` bash
$ cd apportateen
$ npm install
```

3. Build the project

``` bash
$ ng build --prod
```

4. Deploy to Firebase
``` bash
$ firebase deploy
```


## Local tests

1. Go to the [API directory](https://github.com/ProyectoIntegrador2018/apportateen_api) and run command.

``` bash
$ cd apportateen_api
$ nodemon
```

This will start the API locally

2. Go to the [frontend directory](https://github.com/ProyectoIntegrador2018/apportateen), and install the dependencies.

``` bash
$ cd apportateen
$ npm install


3. Now launch the application

``` bash
$ ng serve --open
```

The `ng serve` command launches the server, watches your files, and rebuilds the app as you make changes to those files.
Using the `--open` (or just `-o`) option will automatically open your browser on http://localhost:4200/.
To stop the app from running locally, in the CLI, press `Ctrl`+`C` to exit.
