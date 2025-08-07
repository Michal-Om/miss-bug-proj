const { useState, useEffect } = React

import { bugService } from '../services/bug.service.remote.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'

export function BugIndex() {
    const [bugs, setBugs] = useState(null)
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())
    const [sortBy, setSortBy] = useState({ sortBy: 'title', sortDir: 1 })
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(loadBugs, [filterBy, sortBy, currentPage])

    function loadBugs() {
        bugService.query(filterBy, sortBy, { pageIdx: currentPage })
            .then(({ bugs, totalPages }) => {
                setBugs(bugs)
                setTotalPages(totalPages)
            })

            .catch(err => showErrorMsg(`Couldn't load bugs - ${err}`))
    }

    function onRemoveBug(bugId) {
        bugService.remove(bugId)
            .then(() => {
                const bugsToUpdate = bugs.filter(bug => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug removed')
            })
            .catch((err) => showErrorMsg(`Cannot remove bug`, err))
    }

    function onAddBug() {
        const bug = {
            title: prompt('Bug title?', 'Bug ' + Date.now()),
            severity: +prompt('Bug severity?', 3),
            description: prompt('Bug description?'),
            labels: (
                prompt('Bug labels? (comma separated)', '') || ''
            )
                .split(',')
                .map(label => label.trim())
                .filter(label => label)
        }

        bugService.save(bug)
            .then(savedBug => {
                setBugs([...bugs, savedBug])
                showSuccessMsg('Bug added')
            })
            .catch(err => showErrorMsg(`Cannot add bug`, err))
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?', bug.severity)
        const description = prompt('New description?', bug.description)
        const labels = (
            prompt('New labels? (comma separated)',
                Array.isArray(bug.labels) ? bug.labels.join(',') : ''
            ) || ''
        )
            .split(',')
            .map(label => label.trim())
            .filter(label => label)

        const bugToSave = { ...bug, severity, description, labels }

        bugService.save(bugToSave)
            .then(savedBug => {
                const bugsToUpdate = bugs.map(currBug =>
                    currBug._id === savedBug._id ? savedBug : currBug)

                setBugs(bugsToUpdate)
                showSuccessMsg('Bug updated')
            })
            .catch(err => showErrorMsg('Cannot update bug', err))
    }

    function onSetFilterBy(filterBy) {
        setFilterBy(prevFilter => ({ ...prevFilter, ...filterBy }))
    }

    function onSetSortBy(newSortBy) {
        setSortBy(prevSort => ({
            sortBy: newSortBy,
            sortDir: prevSort.sortBy === newSortBy ? prevSort.sortDir * -1 : 1
        }))
    }

    function onSortChange(ev) {
        const field = ev.target.value
        onSetSortBy(field)
    }

    function onSetSortDir(dir) {
        setSortBy(prev => ({ ...prev, sortDir: dir }))
    }

    function onChangePage(diff) {
        setCurrentPage(prev => {
            const nextPage = prev + diff
            if (nextPage < 0 || nextPage >= totalPages) return prev
            return nextPage
        })
    }

    return (
        <section className="bug-index main-content">

            <BugFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} />
            <div className="sort-controls">
                <label>Sort by: &nbsp;
                    <select value={sortBy.sortBy} onChange={onSortChange}>
                        <option value="title">Title</option>
                        <option value="severity">Severity</option>
                        <option value="createdAt">Created At</option>
                    </select>
                </label>
                <span className="sort-arrow" onClick={() => onSetSortDir(1)}>▲</span>
                <span className="sort-arrow" onClick={() => onSetSortDir(-1)}>▼</span>
            </div>


            <header>
                <h2>Bug List</h2>
                <button onClick={onAddBug}>Add Bug</button>
            </header>
            <section className="bug-controls">
                <button onClick={() => onChangePage(-1)} disabled={currentPage === 0}>
                    Prev
                </button>
                <span>Page: {currentPage + 1}</span>
                <button onClick={() => onChangePage(1)} disabled={currentPage === totalPages - 1}>Next</button>
            </section>
            <BugList
                bugs={bugs}
                onRemoveBug={onRemoveBug}
                onEditBug={onEditBug} />
        </section>
    )
}
