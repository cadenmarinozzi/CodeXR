# Changelog
* April 4, 2022 | 11:54 PM
Removed minimum line length so that code can be generated without even needing a prompt (Just from context) \
Added support for python comments
* April 5, 2022 | 11:33 AM
Created the discord bot to view the report status of CodeXR \
Added statusData to the database and added it to the back-end
* April 5, 2022 | 12:37 PM
Added deployer to deploy the discord bot and back-end whenever there is a change to their respective directories. (I didn't use GitHub actions for it since the discord bot is hosted on my server)
* April 7, 2022 | 8:51 AM
Simplified the prompt for a smaller token quota. \
Lots of refactoring.
* April 7, 2022 | 9:28 AM
Ported all of the firebase web stuff to the back-end