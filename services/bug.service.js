
import { loggerService } from './logger.service.js'
import { makeId, readJsonFile, writeJsonFile } from './util.service.js'

export const bugService = {
    query,
    getById,
    remove,
    save,
}

const bugs = readJsonFile('./data/bug.json')

function query(filterBy = {}) {
    let bugToDisplay = bugs
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        bugToDisplay = bugToDisplay.filter(bug => regExp.test(bug.title))

    }
    if (filterBy.minSeverity) {
        bugToDisplay = bugToDisplay.filter(bug => bug.severity >= filterBy.minSeverity)
    }

    return Promise.resolve(bugToDisplay)
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)

    if (!bug) {
        loggerService.error(`Couldnt find bug ${bugId} in bugService`)
        return Promise.reject(`Couldnt get bug`)
    }
    return Promise.resolve(bug)
}

function remove(bugId) {
    const idx = bugs.findIndex(bug => bug._id === bugId)

    if (idx === -1) {
        loggerService.error(`Couldnt find bug ${bugId} in bugService`)
        return Promise.reject(`Couldnt remove bug`)
    }

    bugs.splice(idx, 1)
    return _savebugs()
}

function save(bug) {
    console.log('bug to save: ', bug)

    if (bug._id) {
        const idx = bugs.findIndex(currBug => currBug._id === bug._id)

        if (idx === -1) {
            loggerService.error(`Couldnt find bug ${bug._id} in bugService`)
            return Promise.reject(`Couldnt save bug`)
        }
        // bug.createdAt = bugs[idx].createdAt
        // bugs.splice(idx, 1, bugToSave)
        bugs[idx] = { ...bugs[idx], ...bug } // Merge updated fields into the existing bug while preserving unchanged properties
    } else {
        bug._id = makeId()
        bug.createdAt = Date.now()
        bug.labels = bug.labels || []
        bugs.unshift(bug)
    }
    return _savebugs()
        .then(() => bug)
        .catch(err => {
            loggerService.error('Failed to write bugs to file', err)
            return Promise.reject(err)
        })
}

function _savebugs() {
    return writeJsonFile('./data/bug.json', bugs)
}