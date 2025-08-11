
const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter
}

function query(filterBy = {}, sortBy = {}, page = {}) {
    const params = {
        ...filterBy,
        ...sortBy,
        ...page
    }
    return axios.get(BASE_URL, { params })
        .then(res => res.data)
}

function getById(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId)
        .then(res => res.data) // why not needed?
}

function save(bug) {
    if (bug._id) {
        return axios.put(BASE_URL + bug._id, bug).then(res => res.data)
    } else {
        return axios.post(BASE_URL, bug).then(res => res.data)
    }
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0 }
}