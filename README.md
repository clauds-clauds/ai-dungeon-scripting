# AI Dungeon Scripting
This repository contains some of my scripting modules, which aim to improve the overall **AI Dungeon** experience.

## MiniCLib
**MiniCLib** is a minified scripting library. It doesn't do anything on its own and is mostly used by my other modules to perform general tasks more easily and quickly. **MiniCLib** is always required by every other scripting module.

## RAoS (Random Assortment of Stuff)
**Random Assortment of Stuff** is a quality-of-life-focused module that currently offers two specific features: repetition detection and quick note writing.

**RAoS** creates a **Random Assortment of Stuff Settings** card when you take your first action. The current tweakable options are:

### Repetition Settings
* **Enabled:** (true|false) - Enables or disables the repetition-checking system.
* **Max Actions:** (8-32) - The amount of actions that get looked at and checked for repeating phrases.
* **Min Words:** (6-12) - The minimum amount of words that need to appear sequentially before a sentence is regarded as a repetition.
* **Max Occurrences:** (1-4) - The maximum allowed occurrences after which a sentence is regarded as a repetition.
* **Show Message:** (true|false) - Shows a direct message if enabled; disable if another script uses state.message.
* **Debug Notes:** (true|false) - Writes the last detected repetition to the Notes section of the settings card.