# TODO

## Important Steps

- Add localized data to data models wehre applicable this should be a as follows



- Set at least one of the lang codes upon creation
- Use rabbitMQ works to translate the rest of the languages async
- DB will be update async-ly
- Some fields will need to be converted on the fly, but many fields are numeric meaning they require to translation

- Revise All gets for resources to get the localize constants from the localization map, so that the equipment needed for a exercises is properly converted
- Revise Exercises to use the keys instead of the values

## Back Burner

- API endpoints to ensure correct behavior
- Revise Program cardio recommendation so that we can track them.
- Revise base exercise json