
import { loggerService } from './logger.service.js'
import { makeId, readJsonFile, writeJsonFile } from './util.service.js'

export const bugService = {
    query,
    getById,
    remove,
    save,
    getEmptyBug,
    getTotalCount
}

const bugs = readJsonFile('./data/bug.json')
const BUGS_PER_PAGE = 4
let totalPages = null

function query(filter, sort, page) {
    console.log('Query called with filter:', filter, 'sort:', sort, 'page:', page)

    let bugsToDisplay = bugs
    if (filter.txt) {
        const regex = new RegExp(filter.txt, 'i')
        bugsToDisplay = bugsToDisplay.filter(bug => regex.test(bug.title)
            || regex.test(bug.description)
            || bug.labels.some(label => regex.test(label)) //.some() returns true if at least one element in the array passes the test function
        )
    }
    if (filter.minSeverity) {
        bugsToDisplay = bugsToDisplay.filter(bug => bug.severity >= filter.minSeverity)
    }

    if (sort.sortBy) { //title, severity, createdAt..
        const numericValues = ['severity', 'createdAt']
        if (numericValues.includes(sort.sortBy)) {
            bugsToDisplay.sort((a, b) => (a[sort.sortBy] - b[sort.sortBy]) * sort.sortDir)
        } else {
            bugsToDisplay.sort((a, b) => (a[sort.sortBy].localeCompare(b[sort.sortBy])) * sort.sortDir)
        }
    }

    const totalPages = Math.ceil(bugsToDisplay.length / BUGS_PER_PAGE)
    let pageIdx = page.pageIdx

    if (pageIdx < 0) pageIdx = 0
    if (pageIdx >= totalPages) pageIdx = totalPages - 1

    let startIndex = pageIdx * BUGS_PER_PAGE
    let endIndex = startIndex + BUGS_PER_PAGE
    bugsToDisplay = bugsToDisplay.slice(startIndex, endIndex)

    return Promise.resolve({
        bugs: bugsToDisplay,
        totalPages
    })
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

        bugs[idx] = { ...bugs[idx], ...bug } // Merge updated fields into the existing bug while preserving unchanged properties
    } else {
        bug._id = makeId()
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

function getTotalCount() {
    return Promise.resolve(totalPages)
}

function getEmptyBug({ title = '', description = '', severity = 1, labels = [] }) {
    return {
        title: title,
        severity: severity,
        createdAt: Date.now(),
        description: description,
        labels: labels
    }
}