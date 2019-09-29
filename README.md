


[![Maintainability](https://api.codeclimate.com/v1/badges/d4fe75c7c58386a27eb2/maintainability)](https://codeclimate.com/github/ProyectoIntegrador2018/apportateen_api/maintainability)


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
