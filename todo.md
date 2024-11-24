# TODO

## Important Steps

- Add Models for tracking workouts of the users
- Add Mechanism for committing to programs, or think of an alternative approach
- Make endpoints for creating and updating workouts

## Back Burner

- Add Posting and updating exercises and perhaps a frontend for approving exercises to be added to the database.

Spin up docker image for RabbitMQ: `docker run -d --hostname my-rabbit --name some-rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management`
Spin up docker image for libreTranslate: `docker run -d --hostname libretranslate --name libretranslate -p 3000:3000 libretranslate/libretranslate:latest`

## Defining Tracking Models

```
IWorkoutSession

{
    userId: mongoose.Schema.Types.ObjectId;
}, Timestamps


```