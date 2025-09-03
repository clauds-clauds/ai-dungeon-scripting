
// Random Assortment of Stuff: An assortment of random stuff! Wow, right?
const RandomAssortmentOfStuff = {
    Functions: {
        // Scans the context and detects hidden phrases, also attempts to find the ending of the sentence for reporting.
        warnAboutRepetition: function (output, context, minWordLength = 8, minOccurrences = 1) {
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

            if (foundPhrases.length >= minOccurrences) {
                const messageContent = foundPhrases.map((p, idx) => `${idx}: ${p}`).join('\n');
                for (const phrase of foundPhrases) MiniCLib.Log.neat("Random Assortment of Stuff", `Detected repetition! ${phrase}`)
                if (state.clauds_repetitionShowMessage) MiniCLib.Log.message("Random Assortment of Stuff", `Detected repetition!\n${messageContent}`)
            }
        }
    },
    Hooks: {
        onInput: function (text) {
            // Settings Story Card configuration down below:
            let settingCardEntry = "Repetition Warning\n> Enabled: true\n> Max Actions: 16\n> Min Words: 8\n> Min Occurrences: 1\n> Show Message: true"
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