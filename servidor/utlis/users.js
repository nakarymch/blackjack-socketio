var users = [];

//Join User to chat
userJoin = (socket, user_id, room_id)=> {
    const user = {socket, user_id, room_id, turn: false, points: 0};
    users.push(user);
    return user;
}

//Get current user
function getCurrentUser(id){
    return users.find(user => user.socket === id);
}

//User Leaves Chat
userLeaves = (id) => {
    let index = users.findIndex(user => user.socket === id);
    if( index !== -1 ) {
        return users.splice(index, 1)[0];
    }
}

//Get Room Users
getGameUsers = () => {
    return users;
}

//Remove all Users
cleanUsers = () => {
    users = []
}


module.exports = {
    userJoin,
    getCurrentUser,
    userLeaves,
    getGameUsers,
    cleanUsers    
};