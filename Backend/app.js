const http = require('http');
const {createServer} = require('node:http');
const {Server} = require('socket.io')

const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const morgan = require('morgan')

const sequelize = require('./util/database');

const userRoutes = require('./routes/user');
const passwordRoutes = require('./routes/password');
const pageRoutes = require('./routes/page')
const chatRoutes = require('./routes/chat');



const User = require('./models/User');
const ForgotPassword = require('./models/ForgotPassword');
const ChatHistory = require('./models/ChatHistory');
const Group = require('./models/Group');
const Groupmember = require('./models/Groupmember');

const cronService = require('./services/cronjob');


const app = express();
var cors = require('cors');
app.use(cors());


const server = createServer(app);
// const io = new Server(server);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
    }
});

cronService.job.start();





require('dotenv').config();

//Established Socket connection
io.on('connection', (socket) => {
    socket.on('message', (mssgDetails, groupId) => {
        io.emit('message', mssgDetails, groupId);
    });

    socket.on('groupUpdates', (updatedGroupDetails) => {
        io.emit('groupUpdates', updatedGroupDetails);
    });

    socket.on('groupCreation', (groupDetails, groupId, flag) => {
        //emit to clients except sender client
        socket.broadcast.emit('groupCreation', groupDetails, groupId, flag);
    });
});







//middlewares with Routes
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(compression());

app.use(express.static(path.join(__dirname, 'public')))


app.use('/user', userRoutes);
app.use('/password', passwordRoutes);
app.use('/chat', chatRoutes);

app.use(pageRoutes);



//DB Associations
User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);  //One to one
Group.belongsToMany(User, {through: Groupmember});
User.belongsToMany(Group, {through: Groupmember});
Group.hasMany(ChatHistory, {onDelete: 'CASCADE'});
ChatHistory.belongsTo(Group);
User.hasMany(ChatHistory);
ChatHistory.belongsTo(User);



const PORT = process.env.PORT_NO;

function initiate(){
    sequelize
        // .sync({force: true})
        .sync()
    .then(()=>{
        server.listen(PORT,()=>{
            console.log(`>>>>Server is listening on port ${PORT}`)
        })
    })
    .catch((err)=>{
        console.log(err);
    }); 
}

initiate();