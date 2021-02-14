## TODO

• add unit tests for each of the endpoints that you have built
• allow checking against a list of roles rather than a single role
• use AJV schema validation for request JSON bodies
• create swagger docs for each of your endpoints
• pass refresh token in cookie in response header back to client
• find a way to save request.$user rather than in request.body.$user if possible

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
