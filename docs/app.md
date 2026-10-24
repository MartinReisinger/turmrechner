# App behavior and privacy

[Back to README](../README.md)

## App behavior

The first launch introduces offline use and local data storage, then asks whether to show the timer.
On iOS, an animated guide follows and explains
how to add the app to the Home Screen. The guide is skipped when launched in standalone mode or on other devices.
Users then choose calculation previews, manual or mental carry handling, haptics,
light/dark/system mode, both color variants, and finally Easy/Normal/Hard. Easy is the default difficulty.
Preview, carry, and timer choices have no defaults and require an explicit selection to advance.
System mode, white, black, and enabled haptics are preselected.
The warm Monokai variant uses `#FDF6E3` paper colors with magenta, petrol, purple, and olive accents.
Dark variants are Black (left, default) and Monokai (right). Dark Monokai uses a `#272822` background
with pink, cyan, purple, and green accents. Saved Charcoal choices migrate to Black.
Color samples reflect the selected assistance options and show an unfinished digit with its cursor.

“Show” displays carries and remainders and requires entering them, including zero.
“In your head” asks for result digits only and computes carries/remainders internally.
A leading result digit such as the 1 in 4 × 3 = 12 always requires user input.
Switching modes during a game preserves the result already entered and resolves a pending carry if needed.
The settings icon opens every preference. Starting a new game keeps preferences.
Privacy and legal notice links appear at the bottom of settings. Provider details in the legal notice
are revealed with a plain text control and use the contact information from the Arbeitszeiterfassung project.
“Reset everything” clears only this app's saved game/preferences/history and restarts onboarding after a native confirmation prompt.
Settings scroll without a visible scrollbar. The installation guide is part of onboarding only.
The app frame and keypad stay fixed while solving; long rows scroll inside the tower.
Onboarding, settings, and history scroll within the app only when their content exceeds the available height.
Language choices are Deutsch, English, and System (default). System follows the first supported device language,
with English as the fallback. Explicit language changes apply immediately to the entire interface.
All text uses `ui-rounded`, with `SF Pro Rounded` and system fallbacks. All UI icons use Lucide.

## Modes, timing, and history

Easy blocks wrong inputs immediately and records failed attempts. Normal accepts all digits, checks at the end
of each row, and corrects mistakes with a digit-wheel animation, right to left for multiplication and left to right for division. Correct rows pulse green without
blocking the next input. Hard leaves wrong answers in place and evaluates only after the entire tower.
During a run, modes can only increase in difficulty; lower mode buttons are disabled. Starting a new game unlocks all modes.
Mode changes take effect at the next row; other preferences apply immediately and all changes are recorded.
Undo is available in Normal/Hard. It restores the previous input including any automatic carry, while retaining
mistake history. Every visible result digit, including leading digits, always requires input.

The optional timer replaces the step counter; the progress bar remains unchanged. Time is recorded even when
hidden. Only active solving counts: settings, history, background, the resume prompt, and automatic row correction
pause the clock. Finished runs are archived once; deleting a run does not cause it to reappear after reopening.
Best times are for error-free runs, grouped by Easy/Normal/Hard or mixed modes.

The history button sits beside settings. Tap a row for details; swipe left to delete, with undo available briefly.
Rows show seed/time above date/error count. Regional dates use 24-hour time; Austria uses day.month.year.
The settings summary lists each option once with all its distinct values. Detailed change timestamps remain stored.

Review colors identify correct input (green), a genuine local mistake (red), and a correctly computed consequence
of an earlier mistake (yellow). Positions with failed inputs are marked red directly in the result row.
Earlier attempts remain stored but are not displayed as extra digits. Native sharing generates a local PNG
of the entire reviewed tower and includes https://turmrechner.martindev.at/ in the image and share payload.
The share text uses the selected app language, describes the starting number and duration, and includes the link once.
There is no upload endpoint or additional download/copy interface. Sharing images requires native file sharing
support; the user selects the destination in the device share sheet.

## Local storage and privacy

Three browser storage entries persist data only in this browser and origin:

- `turmrechner.preferences.v1`: version 3 preferences, including mode, timer, themes, and onboarding progress.
- `turmrechner.session.v1`: a seed draft or version 2 input/undo events, active time, and setting changes.
- `turmrechner.history.v1`: completed runs with the original seed, time, settings, and replayable answers.

Existing preferences and version 1 games migrate without deleting progress. Legacy games have no invented time.
The app replays accepted inputs to restore the exact result digit or carry/remainder input phase.
A reopened active game appears behind a blurred continue/start-fresh dialog. Briefly backgrounding the app does
not open that dialog. Finished games and seed drafts reopen directly. Invalid saved data resets only its own area.
If storage is blocked or full, the app remains usable in memory and reports the problem in settings.
Clearing website data, private browsing restrictions, or browser eviction can remove saved data.
Browsers, devices, and separately installed iOS app contexts may use separate storage; no synchronization is provided.

Inputs and preferences are never sent by the app. There are no third-party requests or remotely loaded fonts.
Fetching the app and checking for updates still make ordinary HTTP requests to the hosting server.
Those requests contain connection metadata; the privacy claim concerns application inputs and stored preferences.

## Offline and updates

The manifest and generated Workbox service worker cache the app shell, bundled code, styles, and icons.
The app works offline after the first complete production load. New versions wait instead of forcing a reload.
When an update is ready, settings offers an explicit reload action. Saved game state survives that reload.
