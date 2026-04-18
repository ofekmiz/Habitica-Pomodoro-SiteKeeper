
### Description:
This extension has two main features:

**1. "Pay to Pass" Website Blocker:**
Website Blocker that plugs into Habitica and limits you from visiting websites that you decide. You can decide to visit these sites by spending Habitica currency, which you'll earn by developing good habits and doing chores.

**2. Pomodoro Timer:**
Including a Pomodoro Timer.
You can read about the pomodoro technique here:
https://habitica.fandom.com/wiki/Pomodoro

During Pomodoro mode, all websites in the list are blocked, websites with cost 0 are blocked only during pomodoro.
A Pomodoro habit is created automatically for the user in Habitica, with an option in the extension settings to automatically score [+] or [-] of the habit when a Pomodoro is done successfully or fails accordingly.

### How to use:
After installing the extension, click on the icon at the top right to open the menu. In here, you must set your API Credentials. You can then block a site by navigating to it and clicking block site. It will ask you to enter a cost. From this point on, when you visit this site, the extension will ask you if you'd like to spend GP to access it. To start a pomodoro timer simply click on the Tomato character. Click again to stop the timer. In the settings you will find a lot of option that allow you tweak and change the pomodoro behavior to fit best for you.

-----------------------------------------

For more information, recommended settings and version update log:
https://habitica.fandom.com/wiki/Habitica_Pomodoro_SiteKeeper

Bug reports and Feature requests are welcome! https://github.com/ofekmiz/Habitica-Pomodoro-SiteKeeper/issues

If you like this project and want to support, you can buy me a coffe :) https://ko-fi.com/ofexcoffee

### Debuging in Firefox:
To test the extension in firefox go to the url "about:debugging" => This firefox => Load Temporary add-on => choose manifest.json file in the app folder.

*Before installing, add the following option to manifest.json to allow using local storage to the temporary add-on:

    "browser_specific_settings": {
        "gecko": {
            "id": "{9ed782e5-6280-4bed-bece-dea374ea9c2f}",
            "strict_min_version": "42.0"
        }
    }

### Tests folder is for Playwrite testing
- Install playwrite dependencies in tests folder (terminal: cd tests , npm i)
- Then install playwrite (terminal: npx playwright install)
- Run tests with UI: npm run test:ui
