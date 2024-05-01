exports.sendMainPage = ( (req, res)=> {
    res.sendFile('index.html', {root: 'views'})
});

exports.sendChatPage = ( (req, res)=> {
    res.sendFile('meetme.html', {root: 'views'})
});