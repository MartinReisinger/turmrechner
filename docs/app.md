# App behavior and privacy

[Back to README](../README.md)

## App behavior

The first launch introduces offline use and local data storage and ends with an Open Source card mentioning GitHub.
On iPhone and iPad, the installation guide
comes immediately after the introduction, unless the app is already installed. Other devices skip this page.
The next pages ask for light/dark/system mode
and both theme variants, followed by timer, calculation preview, carry handling, haptics, and difficulty.
No onboarding option is preselected. Every page has a Next button. Choice pages require an explicit selection
before Next becomes available; the theme page requires both a light and a dark variant.
Next on the difficulty page finishes onboarding. Back remains available on every choice page.
Existing completed onboarding and saved preferences are preserved.
The warm Monokai variant uses `#FDF6E3` paper colors with magenta, petrol, purple, and olive accents.
Dark variants are Black (left) and Monokai (right). Dark Monokai uses a `#272822` background
with pink, cyan, purple, and green accents. Saved Charcoal choices migrate to Black.
Color samples reflect the selected assistance options and show an unfinished digit with its cursor.

“Show” displays carries and remainders and requires entering them, including zero.
“In your head” asks for result digits only and computes carries/remainders internally.
A leading result digit such as the 1 in 4 × 3 = 12 always requires user input.
Switching modes during a game preserves the result already entered and resolves a pending carry if needed.
The settings icon opens every preference. Starting a new game keeps preferences.
Privacy and legal notice links appear at the bottom of settings. Provider details in the legal notice
are revealed with a plain text control and use the contact information from the Arbeitszeiterfassung project.
“Reset everything” clears only this app's saved game/preferences/history/achievements and restarts onboarding after a native confirmation prompt.
Settings scroll without a visible scrollbar.
The app frame and keypad stay fixed while solving; long rows scroll inside the tower.
The frame follows the dynamic viewport height and uses 4 px of bottom padding, including in installed PWAs.
Touch gestures allow scrolling and swiping, with double-tap and pinch zoom disabled throughout the app.
With carry/remainder display enabled, completed rows retain their helpers in every difficulty mode.
Normal retains the corrected helper values after its row animation.
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
Undo is available in Normal/Hard. It restores the previous input including any automatic carry.
Deleted mistakes remain in the replay log but no longer count as errors, red marks, or exclusions from best times.
Easy still counts blocked wrong inputs. This evaluation also applies when older saved runs are replayed. Every visible result digit, including leading digits, always requires input.

The optional timer replaces the step counter; the progress bar remains unchanged. Time is recorded even when
hidden. Only active solving counts: settings, history, achievements, background, the resume prompt, and automatic row correction
pause the clock. Finished runs are archived once; deleting a run does not cause it to reappear after reopening.
Best times are for error-free runs, grouped by Easy/Normal/Hard or mixed modes.

The game header contains trophy, history, and settings buttons. Tap a row for details; swipe left to delete.
The deletion message and undo action stay at the bottom of the viewport for seven seconds, independent of list length
or scroll position. Extra bottom space keeps the last entry reachable above the message.
Rows show seed/time above date/error count. Regional dates use 24-hour time; Austria uses day.month.year.
The settings summary lists each option once with all its distinct values. Detailed change timestamps remain stored.

Review colors identify correct input (green), a genuine local mistake (red), and a correctly computed consequence
of an earlier mistake (yellow). Retained mistakes and blocked Easy inputs are marked red directly in the result row.
Earlier attempts remain stored but are not displayed as extra digits. The review and shared image show one result row
per operation, without intermediate correction lines. Carries sit close above the digits with compact row spacing.
Native sharing generates a local PNG
of the entire reviewed tower and includes https://turmrechner.com/ in the image and share payload.
The share text uses the selected app language, describes the starting number and duration, and includes the link once.
There is no upload endpoint or additional download/copy interface. Sharing images requires native file sharing
support; the user selects the destination in the device share sheet.

## Achievements

The trophy opens nine achievements, each with its own Lucide icon, playful name, and description in German and English.
Unlocked achievements appear first with their description and unlock date. Locked descriptions are blurred and hidden
from screen readers. The list has no visible scrollbar and shows no individual counters or theme checklist.
The overall count remains visible. The share icon beside the heading exports the whole collection
as a local PNG with an app link through native file sharing. Collection images hide locked descriptions too.
The caption includes the unlocked count and names. Devices without native file sharing cannot use this control.

Achievements cover the first clean row, streaks of 5 and 10 clean rows in one tower, the first finished tower,
the first clean tower, 10 and 50 clean towers, all four applied themes, and the first effective digit deletion.
Deleted Normal/Hard mistakes are allowed. Blocked Easy mistakes, automatic row correction, wrong retained helpers,
and consequences of earlier wrong results prevent a clean row. Assistance settings and difficulty impose no extra requirements.
Hard rows count only after completion, so achievements do not reveal correctness while solving.
New towers start a new row streak. Reloading or resuming an eligible tower preserves progress without double counting.

An achievement appears for four seconds below the game progress bar or below the header on other pages, including settings.
Simultaneous unlocks share one card; later unlocks queue. Cards do not take focus or pause solving.
Tapping a card opens the collection. Changing pages dismisses pending cards. Reduced motion disables transitions.
Only themes applied globally while the app is visible count. Selecting an inactive theme variant or viewing its preview does not count.

Tracking starts with the update. Existing history and towers already in progress do not receive retrospective achievements.
The currently applied theme counts from the first visible load. Deleting a saved run preserves achievements.
“Reset everything” clears achievement progress too.

## Local storage and privacy

Four browser storage entries persist data only in this browser and origin:

- `turmrechner.preferences.v1`: version 3 preferences, including mode, timer, themes, and onboarding progress.
- `turmrechner.session.v1`: a seed draft or version 2 input/undo events, active time, and setting changes.
- `turmrechner.history.v1`: completed runs with the original seed, time, settings, and replayable answers.
- `turmrechner.achievements.v1`: unlock dates, applied themes, best row streak, clean tower count, and active run identity.

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
