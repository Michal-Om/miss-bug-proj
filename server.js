import express from 'express'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()
app.use(express.static('public'))

// app.get('/', (req, res) => res.send('Hello there'))
app.listen(3030, () => console.log('Server ready at http://localhost:3030'))



app.get('/api/bug', (req, res) => {
    bugService.query()
        .then(bugs => res.send(bugs))
})

app.get('/api/bug/save', (req, res) => {
    const { title, description, severity, createdAt, _id } = req.query
    const bugToSave = {
        _id,
        title,
        description,
        severity: +severity,
        createdAt
    }

    bugService.save(bugToSave)
        .then(savedbug => res.send(savedbug))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send(err)
        })
})

app.get('/api/bug/:bugId', (req, res) => {
    const bugId = req.params.bugId
    console.log('Requested bugId:', bugId)

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send(err)
        })
})

app.get('/api/bug/:bugId/remove', (req, res) => {
    const bugId = req.params.bugId

    bugService.remove(bugId)
        .then(() => res.send(`bug ${bugId} deleted`))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send(err)
        })
})


// app.get('/nono', (req, res) => res.redirect('/'))


