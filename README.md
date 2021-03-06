## TODO

• create factory for creating generic createOne, deleteOne, getOne, getAll, updateOne, deleteOne functions that can be used inside controllers
• add unit tests for each of the endpoints that you have built
• organize files by feature rather than by category (I am spending too much time scanning up and down the explorer to find related files)
• allow checking against a list of roles rather than a single role
• use AJV/JOI schema validation for request JSON bodies
• create swagger docs for each of your endpoints
• pass refresh token in cookie in response header back to client
• amend code to send tokens (e.g. access token or refresh token) in httpOnly cookie in response header rather than as part of JSON response body
• use pino for express logging (Perhaps use chalk too?)
• built a small REPL tool for inserting/removing demo data into MongoDB
• add better edgecase handling e.g.

- if user is signed in and tries to sign in again, raise an error saying they are already signed in
- if user is signed out and tries to sign out again, raise an error saying they are already signed out
- if user is signed in and tries to sign up, raise an error saying they need to sign out first

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
