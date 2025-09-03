
// Random Assortment of Stuff: An assortment of random stuff! Wow, right?
const RandomAssortmentOfStuff = {
    Functions: {
        // Scans the context and detects repeating phrases, also attempts to find the ending of the sentence for reporting.
        warnAboutRepetition: function (output, context, minWordLength = 8, minOccurrences = 1) {
            // I still need to document this whole thing but I procrastined so long that I kinda forgot how it works.
            // I'll totes do that later...

            // Uncomment this to check how long this whole thing takes.
            // MiniCLib.Timer.start()
            const cleanText = (text) => (text ? text.trim().replace(/\s+/g, ' ') : '')
            const normalizeWord = (word) => word.toLowerCase().replace(/^[.,!?;:]+|[.,!?;:]+$/g, '')

            const outputWords = cleanText(output).split(' ')
            if (outputWords.length < minWordLength) return

            const contextWords = cleanText(context).split(' ').map(normalizeWord)

            const contextPhrases = new Set()

            for (let i = 0; i <= contextWords.length - minWordLength; i++) {
                contextPhrases.add(contextWords.slice(i, i + minWordLength).join(' '))
            }
            if (contextPhrases.size === 0) return

            const outputWordsNorm = outputWords.map(normalizeWord)
            const foundPhrases = []

            for (let i = 0; i <= outputWordsNorm.length - minWordLength;) {
                const currentPhrase = outputWordsNorm.slice(i, i + minWordLength).join(' ')

                if (contextPhrases.has(currentPhrase)) {
                    let sentenceEnd = i + minWordLength - 1
                    while (sentenceEnd < outputWords.length - 1 && !/[.!?"]$/.test(outputWords[sentenceEnd])) {
                        sentenceEnd++
                    }

                    const phrase = outputWords.slice(i, sentenceEnd + 1).join(' ')
                    foundPhrases.push(phrase)
                    i = sentenceEnd + 1
                } else {
                    i++
                }
            }

            // Do some stuff if there are actually any repeating phrases.
            if (foundPhrases.length >= minOccurrences) {
                const messageContent = foundPhrases.map((p, idx) => `${idx}: ${p}`).join('\n');

                // Print all the repeating phrases in the console.
                for (const phrase of foundPhrases) MiniCLib.Log.neat("Random Assortment of Stuff", `Detected repetition! ${phrase}`)

                // Show a message if that is turned on, can interfere with other script libraries so there's that.
                if (state.clauds_repetitionShowMessage) MiniCLib.Log.message("Random Assortment of Stuff", `Detected repetition!\n${messageContent}`)

                // Also write it to the notes section of the settings card if enabled.
                if (state.clauds_repetitionDebugNotes) MiniCLib.Find.storyCard("Random Assortment of Stuff Settings").description = `Latest repetition:\n${messageContent}`
            } else if (state.clauds_repetitionDebugNotes) {
                MiniCLib.Find.storyCard("Random Assortment of Stuff Settings").description = `Latest repetition:\nNo repetition detected!`
            }

            // Uncomment this to check how long this whole thing takes.
            // MiniCLib.Timer.stop()
        }
    },
    Hooks: {
        onInput: function (text) {
            // Settings Story Card configuration down below:
            let settingCardEntry = "Repetition Warning\n> Enabled: true\n> Max Actions: 16\n> Min Words: 8\n> Min Occurrences: 1\n> Show Message: true\n> Debug Notes: true"
            let settingsCard = MiniCLib.Find.storyCard("Random Assortment of Stuff Settings", true, settingCardEntry, "Scripting")

            // Parse the settings from it.
            // NOTE TO SELF: Check if there is a more performance friendly way of doing this, more caching?
            state.clauds_repetitionWarningEnabled = MiniCLib.Read.setting(settingsCard.entry, "Enabled", true)

            // Do the rest only if the system is actually enabled.
            if (state.clauds_repetitionWarningEnabled) {
                state.clauds_repetitionMaxActions = MiniCLib.Read.setting(settingsCard.entry, "Max Actions", 16)
                state.clauds_repetitionMinWords = MiniCLib.Read.setting(settingsCard.entry, "Min Words", 8)
                state.clauds_repetitionMinOccurrences = MiniCLib.Read.setting(settingsCard.entry, "Min Occurrences", 1)
                state.clauds_repetitionShowMessage = MiniCLib.Read.setting(settingsCard.entry, "Show Message", true)
                state.clauds_repetitionDebugNotes = MiniCLib.Read.setting(settingsCard.entry, "Debug Notes", true)
            }

            // No text is modified, so just return as is.
            return text
        },
        onContext: function (text) {
            return text
        },
        onOutput: function (text) {
            if (state.clauds_repetitionWarningEnabled) RandomAssortmentOfStuff.Functions.warnAboutRepetition(text, MiniCLib.Utils.recentContext(state.clauds_repetitionMaxActions), state.clauds_repetitionMinWords, state.clauds_repetitionMinOccurrences)
            return text
        }
    }
}