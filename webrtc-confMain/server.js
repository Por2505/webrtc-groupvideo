const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const express = require('express')
const app = express()
var connectionId;
var _userConnections = [];
//routes
//app.get('/', (req, res) => {
//    res.render('index')
//})
app.use(express.static(path.join(__dirname, '')));
//Listen on port 3000
server = app.listen(3000)


//socket.io instantiation
const io = require("socket.io")(server);


const PORT = 3000 || process.env.PORT;

//console.log(`Server running on port ${PORT}`);




io.on('connection', (socket) => {


    //    console.log(user_id);

    socket.on('userconnect', (data) => {
        console.log('userconnect', data.dsiplayName, data.meetingid);
        var other_users = _userConnections.filter(p => p.meeting_id == data.meetingid);
        _userConnections.push({
            connectionId: socket.id,
            user_id: data.dsiplayName,
            meeting_id: data.meetingid
        });
        console.log(_userConnections.map(a => a.connectionId));
        console.log(_userConnections);
        console.log(`connection id: ${connectionId} socket id:${socket.id}`);

        other_users.forEach(v => {
            socket.to(v.connectionId).emit('informAboutNewConnection', {
                other_user_id: data.dsiplayName,
                connId: socket.id
            });
        });

        socket.emit('userconnected', other_users);



        //        _userConnections[0].meeting_id
    })

    socket.on('exchangeSDP', (data) => {

        socket.to(data.to_connid).emit('exchangeSDP', {
            message: data.message,
            from_connid: socket.id
        });

    }); //end of exchangeSDP
    socket.on('reset', (data) => {
        var userObj = _userConnections.find(p => p.connectionId == socket.id);
        if (userObj) {
            var meetingid = userObj.meeting_id;
            var list = _userConnections.filter(p => p.meeting_id == meetingid);
            _userConnections = _userConnections.filter(p => p.meeting_id != meetingid);

            list.forEach(v => {
                socket.to(v.connectionId).emit('reset');
            });

            socket.emit('reset');
        }

    }); //end of reset

    socket.on('disconnect', function () {
        console.log('Got disconnect!');
        var userObj = _userConnections.find(p => p.connectionId == socket.id);
        if (userObj) {
            var meetingid = userObj.meeting_id;

            _userConnections = _userConnections.filter(p => p.connectionId != socket.id);
            var list = _userConnections.filter(p => p.meeting_id == meetingid);
            console.log(`disconnected socket id   ${socket.id}`);
            console.log(`connection id: ${connectionId} socket id:${socket.id}`);
                        list.forEach(v => {
                            socket.to(v.connectionId).emit('informAboutConnectionEnd', socket.id);
                        });
        }
    })



})
