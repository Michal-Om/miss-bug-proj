import express from 'express'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import cookieParser from 'cookie-parser'

const app = express()
app.use(express.static('public'))
app.use(cookieParser())

// Basic - Routing in express
// app.get('/', (req, res) => res.send('Hello there'))
//app.get('/nono', (req, res) => res.redirect('/'))

// Real routing express
//List
app.get('/api/bug', (req, res) => {
    bugService.query()
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot get bugs')
        })
})

//Save
app.get('/api/bug/save', (req, res) => {
    const { title, description, severity, _id } = req.query
    console.log('Server received save request:', req.query)
    const bugToSave = {
        _id,
        title,
        description,
        severity: +severity,
    }
    console.log('Bug to save:', bugToSave)

    bugService.save(bugToSave)
        .then(savedbug => res.send(savedbug))
        .catch(err => {
            loggerService.error('Failed to save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

//Read - getById
app.get('/api/bug/:bugId', (req, res) => {
    const bugId = req.params.bugId
    console.log('Requested bugId:', bugId)

    let visitedBugs = []
    //if cookie exists parse into an array
    if (req.cookies.visitedBugs) {
        visitedBugs = JSON.parse(req.cookies.visitedBugs)
    } else {
        visitedBugs = []
    }
    console.log('Visited bugs:', visitedBugs)

    if (!visitedBugs.includes(bugId)) {
        if (visitedBugs.length >= 3) {
            console.log('User has reached limit of 3 bugs')
            return res.status(401).send('Wait for a bit')
        }
        visitedBugs.push(bugId)
    }

    //save to cookie:
    res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 1000 * 20 })
    console.log('User visited at the following bugs:', visitedBugs)

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot get bug', err)
            res.status(400).send('Cannot get bug')
        })
})

//Remove
app.get('/api/bug/:bugId/remove', (req, res) => {
    const bugId = req.params.bugId

    bugService.remove(bugId)
        .then(() => res.send(`bug ${bugId} deleted`))
        .catch(err => {
            loggerService.error('Cannot get bug', err)
            res.status(400).send('Cannot get bug')
        })
})


const port = 3030
app.listen(port, () => loggerService.info(`Server listening on port http://127.0.0.1:${port}/`))



