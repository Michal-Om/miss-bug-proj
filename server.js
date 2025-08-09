import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import { userService } from './services/user.service.js'
import { authService } from './services/auth.service.js'

const app = express()
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

// Real routing express
//List
app.get('/api/bug', (req, res) => {

    console.log('GETTING BUGS');
    const { txt, minSeverity, sortBy, sortDir, pageIdx } = req.query
    //BACKEND FILTER
    const filter = {
        txt: txt || '',
        minSeverity: +minSeverity || 1,
    }
    console.log('filterBy:', filter)

    const sort = {
        sortBy: sortBy,
        sortDir: parseInt(sortDir) || 1
    }

    const page = {
        pageIdx: parseInt(pageIdx) || 0
    }
    bugService.query(filter, sort, page)
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot get bugs')
        })
})

//Creat
app.post('/api/bug', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot add bug')
    console.log('Server received save request:', req.body)

    const bugToSave = bugService.getEmptyBug(req.body)
    console.log(bugToSave)

    bugService.save(bugToSave, loggedinUser)
        .then(savedbug => res.send(savedbug))
        .catch(err => {
            loggerService.error('Failed to save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

//Update
app.put('/api/bug/:bugId', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot update bug')

    const { _id, title, description, severity, labels } = req.body
    console.log('Server received save request:', req.body)
    const bugToSave = {
        _id,
        title,
        description,
        severity: +severity,
        labels
    }
    console.log('Bug to save:', bugToSave)

    bugService.save(bugToSave, loggedinUser)
        .then(savedbug => res.send(savedbug))
        .catch(err => {
            loggerService.error('Failed to save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

//Read - getById
app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    // const bugId = req.params.bugId
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
app.delete('/api/bug/:bugId', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot delete bug')

    const { bugId } = req.params
    bugService.remove(bugId, loggedinUser)
        .then(() => res.send(`bug ${bugId} deleted`))
        .catch(err => {
            loggerService.error('Cannot get bug', err)
            res.status(400).send('Cannot get bug')
        })
})

//User API
app.get('/api/user', (req, res) => {
    userService.query()
        .then(users => res.send(users))
        .catch(err => {
            loggerService.error('Cannot load users', err)
            res.status(400).send('Cannot load users')
        })
})

app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params
    userService.getById(userId)
        .then(user => res.send(user))
        .catch(err => {
            loggerService.error('Cannot get user', err)
            res.status(404).send('User not found')
        })
})

//Auth API
app.post('/api/auth/login', (req, res) => {
    const credentials = req.body
    authService.checkLogin(credentials)
        .then(user => {
            if (user) {
                const loginToken = authService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            }
        })
        .catch(err => {
            loggerService.error('Login failed', err)
            res.status(404).send('Invalid Credentials')
        })
})

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body
    userService.add(credentials)
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(err => {
            loggerService.error('Signup failed', err)
            res.status(400).send('Signup failed')
        })
})

const port = 3030
app.listen(port, () => loggerService.info(`Server listening on port http://127.0.0.1:${port}/`))

// app.listen(port, () => {
//     console.log(`Listening on http://127.0.0.1:${port}/`)
// })

