## TODO

• in some controller methods you pass errors to next(); in others you throw an error. Update the code to use the latter approach consistently.
• add instructions to start up a local mongodb instance in docker for development
• add instructions to connect to mongodb instance in the cloud for production

# We follow a fat model, thin controller architecture i.e. we want as much business logic to go into the models and as little as possible into the controllers.

### USE LOCAL MONGODB

## Download MongoDB

```sh
$ docker pull mongo
```

## Start up MongoDB

```sh
$ docker run -d -p 27017-27019:27017-27019 --name mongodb mongo
```

## Connect to MongoDB via Shell

```sh
$ docker exec -it mongodb mongo
```
