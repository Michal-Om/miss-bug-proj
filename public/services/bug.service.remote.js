
const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter
}

function query(filterBy = {}) {
    return axios.get(BASE_URL, { params: filterBy })
        .then(res => res.data)
    //FRONTEND FILTER
    // .then(bugs => {

    //     if (filterBy.txt) {
    //         const regExp = new RegExp(filterBy.txt, 'i')
    //         bugs = bugs.filter(bug => regExp.test(bug.title))
    //     }

    //     if (filterBy.minSeverity) {
    //         bugs = bugs.filter(bug => bug.severity >= filterBy.minSeverity)
    //     }

    //     return bugs
    // })
}

function getById(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
}

function remove(bugId) {
    return axios.get(BASE_URL + bugId + '/remove')
        .then(res => res.data) // why not needed?
}

function save(bug) {
    return axios.get(BASE_URL + 'save', { params: bug })
    // var queryStr = `?title=${bug.title}&description=${bug.description}&severity=${bug.severity}`
    // if (bug._id) queryStr += `&_id=${bug._id}`
    // console.log('Saving bug with query:', queryStr)

    // return axios.get(BASE_URL + 'save/' + queryStr)
    //     .then(res => res.data)
}


function getDefaultFilter() {
    return { txt: '', minSeverity: 0 }
}