const { Link } = ReactRouterDOM

import { authService } from '../services/auth.service.js'
import { BugPreview } from './BugPreview.jsx'

export function BugList({ bugs, onRemoveBug, onEditBug }) {
    const loggedinUser = authService.getLoggedinUser()

    function canUpdateBug(bug) {
        if (!bug.creator) return true
        if (!loggedinUser) return false
        return bug.creator._id === loggedinUser._id
    }
    if (!bugs) return <div>Loading...</div>

    return <ul className="bug-list">
        {bugs.map(bug => (
            <li key={bug._id}>
                <BugPreview bug={bug} />
                <section className="actions">
                    <button><Link to={`/bug/${bug._id}`}>Details</Link></button>
                    {
                        canUpdateBug(bug) &&
                        <div>
                            <button onClick={() => onRemoveBug(bug._id)}>x</button>
                            <button onClick={() => onEditBug(bug)}>Edit</button>
                        </div>
                    }


                </section>
            </li>
        ))}
    </ul >
}
