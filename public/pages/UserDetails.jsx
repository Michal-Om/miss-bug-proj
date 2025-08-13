const { useParams, useNavigate, Link } = ReactRouterDOM
const { useState, useEffect } = React

import { BugList } from '../cmps/BugList.jsx'
import { userService } from '../services/user.service.js'
import { bugService } from '../services/bug.service.remote.js'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'


export function UserDetails() {
    const [user, setUser] = useState(null)
    const [userBugs, setUserBugs] = useState(null)
    const params = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        loadUser()
        loadUserBugs()
    }, [params.userId])

    function loadUser() {
        userService.getById(params.userId)
            .then(setUser)
            .catch(err => {
                console.log('err:', err)
                navigate('/')

            })
    }

    function loadUserBugs() {
        bugService.query({ userId: params.userId })
            .then(res => {
                setUserBugs(res.bugs)
            })
            .catch(err => {
                console.error('bugService.query failed', err);
            })
    }

    function onRemoveBug(bugId) {
        bugService.remove(bugId)
            .then(() => {
                console.log('Deleted succesfully!')
                setUserBugs(prevBugs => prevBugs.filter(bug => bug._id !== bugId))
                showSuccessMsg('Bug removed')
            })
            .catch(err => {
                console.log('problem removing bug', err)
                showErrorMsg('Cannot remove bug')
            })
    }

    function onEditBug(bug) {
        const severity = +prompt('NewSeverity?')
        if (!severity) return alert('Please enter severity')
        const description = prompt('New description?')
        const bugToSave = { ...bug, severity, description }
        bugService.save(bugToSave)
            .then(savedBug => {
                console.log('Updated Bug:', savedBug)
                setUserBugs(prevBugs => prevBugs.map(currBug =>
                    currBug._id === savedBug._id ? savedBug : currBug
                ))
                showSuccessMsg('Bug Updated')
            })
            .catch(err => {
                console.log('Problem editing bug', err)
                showErrorMsg('Cannot update bug')
            })
    }

    if (!user) return null

    return <section className='user-details'>
        <h1>Hello {user.fullname}</h1>
        {!userBugs || (!userBugs.length && <h2>No bugs to show</h2>)}
        {userBugs && userBugs.length > 0 && <h3>Manage your bugs</h3>}
        <BugList bugs={userBugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
        <Link to="/">Back Home</Link>
    </section>

}