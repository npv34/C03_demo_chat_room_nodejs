const http = require('http');
const url = require('url');
const fs = require('fs');
const { Server } = require('socket.io');
const PORT = 8080;
const server = http.createServer(((req, res) => {
    let urlPath = url.parse(req.url).pathname;

    // xu ly  request voi url /
    if (urlPath === '/') {
        fs.readFile('./views/index.html', 'utf8', (err, data) => {
            if (err) throw new Error(err.message);

            res.writeHead(200, 'oke', { 'Content-type': 'text/html' });
            res.write(data);
            res.end()

        });


    }
}))


const io = new Server(server);

let users = [
    {
        socket_id: null,
        username: 'admin',
        rooms: 'room1',
        color: 'red'
    },
    {
        socket_id: null,
        username: 'teo',
        rooms: 'room1',
        color: 'red'
    },
    {
        socket_id: null,
        username: 'map',
        rooms: 'room2',
        color: 'red'
    }
]

io.on('connection', (socket) => {

    socket.on('login', data => {
        let user = findUser(data.username);
        if (user.length > 0) {

            // join vao room dung ham socket.join('name_room)
            socket.join(user[0].rooms)
            // thay doi thuoc tinh socket_id = id cua socket
            user[0].socket_id = socket.id;
            user[0].color = 'green';

            let userOfRoom = getUserRoom(user[0].rooms)

                io.sockets.to(user[0].rooms).emit('show-user-room', { usersRoom: userOfRoom })

        }
    })

    socket.on('disconnect', () => {

        let userLogout = findUserBySocketID(socket.id);
        if (userLogout.length > 0) {
            userLogout[0].color = 'red';

            let userOfRoom = getUserRoom(userLogout[0].rooms)
            io.sockets.to(userLogout[0].rooms).emit('show-user-room', { usersRoom: userOfRoom })
        }
    })

    socket.on('send-message', (data) => {
        let userSendMessage = findUserBySocketID(data.id);

        if (userSendMessage.length > 0) {

            let messageSend = `${userSendMessage[0].username}: ${data.message}`;

            io.sockets.to(userSendMessage[0].rooms).emit('read-message', { message: messageSend})
        }

    })


})


function findUser(username) {
    return users.filter(item => item.username === username)
}

function findUserBySocketID(sockeid) {
    return users.filter(item => item.socket_id === sockeid)
}

function getUserRoom(room) {
    return users.filter(item => item.rooms === room)
}


server.listen(PORT, 'localhost', () => {
    console.log('server listening on port ' + PORT)
})
