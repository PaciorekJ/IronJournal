# TODO

## Important Steps

- Use rabbitMQ works to translate the rest of the languages async
- DB will be update async-ly

- Ensure searching and retrieving localized document is correct!
- Make sure that localize searches will fall back to the creators language as this is 100% there! As of now english is the default for almost all fallbacks but using the users native language would be optimal for UX weight out the pros and cons of this to see if this is worth adding.

## Back Burner

- API endpoints to ensure correct behavior
- Revise Program cardio recommendation so that we can track them.
- Revise base exercise json

Spin up docker image for RabbitMQ: `docker run -d --hostname my-rabbit --name some-rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management`
Spin up docker image for libreTranslate: `docker run -d --hostname libretranslate --name libretranslate -p 3000:3000 libretranslate/libretranslate:latest`