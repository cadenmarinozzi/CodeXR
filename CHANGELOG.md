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
* April 7, 2022 | 10:48 AM
Added a new context getter that supporta prefix and suffix text
* April 7, 2022 | 8:22 PM
Added a completion cache to cache previously completed prompts.
Added a code formatter to prettify the completion code.
Reworked the prompt.
Automatically check the status of the back-end when the statusChart is sent every hour.
* April 8, 2022 | 4:58 PM
Moved the base prompt to the back-end
* April 9,10 | UNDOCUMENTED
* April 11 | 7:41 PM
Fixed support for python comments by sending the comment token to the back-end
Added a clear completion cache button
Changed the completion cache to a dictionary