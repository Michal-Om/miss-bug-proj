
import { makeId, readJsonFile, writeJsonFile } from './util.service.js'

let users = readJsonFile('data/user.json')

export const userService = {
    query,
    getById,
    getByUsername,
    remove,
    add,
}

function query() {
    const usersToReturn = users.map(user => ({
        _id: user._id,
        fullname: user.fullname,
        username: user.username
    }))
    return Promise.resolve(usersToReturn)
}

function getById(userId) {
    var user = users.find(user => user._id === userId)
    if (!user) return Promise.reject('User not found!')

    user = { ...user }
    delete user.password

    return Promise.resolve(user)
}

function getByUsername(username) {
    // You might want to remove the password validation for dev
    var user = users.find(user => user.username === username)
    return Promise.resolve(user)
}

function remove(userId) {
    users = users.filter(user => user._id !== userId)
    return _saveUsersToFile()
}

//QUESTION: should I use this?
//function signup({ fullname, username, password }){
// if(!fullname || !userename || !password)
// return Promise.reject('Incomplete credentials')
// }

function add(user) {

    return getByUsername(user.username) // Check if username exists...
        .then(existingUser => {
            if (existingUser) return Promise.reject('Username taken')
            // const user ={
            //    _id: makeId(),
            //    fullname,
            //    username,
            //    password,
            //    isAdmin: false, 
            //}
            user._id = makeId()
            // Later, we will call the authService here to encrypt the password
            users.push(user)

            return _saveUsersToFile()
                .then(() => {
                    user = { ...user }
                    delete user.password
                    return user
                })
        })
}

function _saveUsersToFile() {
    return writeJsonFile('data/user.json', users)
}

