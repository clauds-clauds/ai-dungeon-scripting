
// MiniCLib: This is a minified version of my personal scripting library.
// Put this into the Library section of the AI Dungeon Scripting tab.
const MiniCLib = {
    Log: {
        // If this is set to true then the console log below is disabled.
        isProduction: true,
        // Simply logs a message to the console (if not prod) whilst sticking with a prettier format.
        neat: function (from, text) {
            if (this.isProduction) return
            console.log(`${from}: ` + text)
        },
        // Shows a message, very useful comment.
        message: function (from, text, generateUUID = true) {
            state.message = `${from}: ${text}\n${generateUUID ? `UUID: ${MiniCLib.Utils.generateUUID()}` : ""}`
        }
    },
    Timer: {
        initial: 0,
        start: function () {
            this.initial = Date.now()
        },
        stop: function () {
            MiniCLib.Log.neat("MiniCLib", Date.now() - this.initial + "ms!")
        }
    },
    Utils: {
        // Generates a pseudo-UUID, handy for debugging actions.
        generateUUID: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0 // To be fair, this function is enigmatic at best.
                const v = c === 'x' ? r : (r & 0x3 | 0x8) // Occult at worst.
                return v.toString(16)
            })
        },
        // Retrieves the context over a specific number of actions.
        recentContext: function (maxActions) {
            MiniCLib.Log.neat("MiniCLib", `Going back ${maxActions} actions!`)
            let context = "";
            const startIndex = Math.max(0, history.length - 1 - maxActions);
            for (let i = history.length - 1; i > startIndex; i--) {
                context += history[i].text;
            }
            return context.trim();
        },
    },
    Find: {
        // Tries to find a Story Card, also includes SC creation and caching for performance reasons.
        storyCard: function (name, createIfNotFound = false, entry = "I don't have much to say.", category = "Uncategorized") {
            // Checks if there is a card cache saved in state, if not then ensure there is still a place to add our cached stuffies.
            if (!state.clauds_cardCache) state.clauds_cardCache = {}

            // Try to find a pre-existing cached card.
            const cachedId = state.clauds_cardCache[name]

            // If that is is not null then ensure everything matches up.
            if (cachedId) {
                // This can probably be more performance friendly, but then again how many cards can anyone have?
                const cardFromCache = storyCards.find(card => card.id === cachedId)

                // Either return the cached card or delete it if somethin' is off.
                if (cardFromCache) return cardFromCache
                else delete state.clauds_cardCache[name]
            }

            // Loop through all the current Story Cards.
            for (const card of storyCards) {
                // Check if the keys include whatever the name is, since that is most often used anyways.
                // Using the title is also valid but the Scripting API lacks that cute little tidbit, so this is fine for now.
                if (card.keys.includes(name)) {
                    state.clauds_cardCache[name] = card.id
                    return card
                }
            }

            // If the card creation options is enabled then this handles, well, that.
            if (createIfNotFound) {
                const newIndex = addStoryCard(name, entry, category)
                const newCard = storyCards[newIndex - 1] // Why does this count length + 1?
                state.clauds_cardCache[name] = newCard.id
                return newCard
            }

            // If we reach this point then the card doesn't exist and the creation was disabled.
            return null
        },
        // Finds a command and its arguments from a block of text.
        command: function (text, stripInvalidEndChars = true) {
            // I like commands beginning with '/' so check for that.
            const commandIndex = text.indexOf('/')

            // If there is no '/' then there is no command.
            if (commandIndex === -1) return null

            const commandString = text.substring(commandIndex + 1).trim()

            if (!commandString) return []

            const regex = /{[^}]+}|[^{}\s]+/g
            const matches = commandString.match(regex)

            if (!matches) return []

            // Map the commands into arguments, so we can use the result like commands[0] = command, command[1] = argument 0, etc.
            // It also has support for 2 word names, so you can do stuff like: "/note {Steve Jacobi} I forgot what I wanted to note."
            const processedArgs = matches.map(arg => {
                let processedArg = arg
                if (arg.startsWith('{') && arg.endsWith('}')) processedArg = arg.substring(1, arg.length - 1)
                if (stripInvalidEndChars) processedArg = processedArg.replace(/[^a-zA-Z]+$/, '')
                return processedArg
            })

            return processedArgs.filter(arg => arg !== '')
        }
    },
    Remove: {
        // Attempts to remove a command (and its arguments) from a block of text.
        command: function (text) {
            // I am too tired right now to explain this thing, procrastination it is.
            // It just tries to remove a command and add a "." if that is missin'.
            const commandIndex = text.indexOf('/')

            if (commandIndex === -1) {
                return text
            }

            let beforeCommand = text.substring(0, commandIndex).trimEnd()
            const endOfLineIndex = text.indexOf('\n', commandIndex)

            const contentBefore = beforeCommand.replace(/\n?>\s*/, '').trim()
            if (contentBefore.length > 0 && !beforeCommand.endsWith('.')) {
                beforeCommand += '.'
            }

            if (endOfLineIndex === -1) {
                return beforeCommand
            }

            const afterCommand = text.substring(endOfLineIndex)
            return beforeCommand + afterCommand
        }
    },
    Read: {
        // Reads settings from a Story Card with valid value types being string, booleans, numericals and all that jazz.
        setting: function (entryText, settingName, defaultValue) {
            const regex = new RegExp(`^>\\s*${settingName}:\\s*(.+)`, 'm')
            const match = entryText.match(regex)

            if (!match || typeof match[1] !== 'string') {
                return defaultValue
            }

            const value = match[1].trim()

            if (value.toLowerCase() === 'true') return true
            if (value.toLowerCase() === 'false') return false

            const num = parseFloat(value)
            if (!isNaN(num) && isFinite(value)) return num

            return value
        }
    },
    Debug: {
        // Shows a simple "Hello World" message to the user.
        helloWorld: function () {
            MiniCLib.Log.message("MiniCLib", "Hello world!")
        },
        // Shows the current command and its arguments to the user.
        commandLine: function (text) {
            // Try to parse commands from the current thing.
            result = MiniCLib.Find.command(text)

            // If there was stuff found.
            if (result != null) {
                let message = "Debugging command information:"
                for (let i = 0; i < result.length; i++) message += `\n[${i}] ` + result[i]
                MiniCLib.Log.message("MiniCLib", message, true)
            }
        }
    }
}