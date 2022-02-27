// https://www.youtube.com/watch?v=FduLSXEHLng
const WebScoket = require('ws');

const wss = new WebScoket.Server({ port: 8888 });


var FUsers = [
    {
        username: 'ram',
        password: '123'
    },
    {
        username: 'shyam',
        password: '465'
    },
    {
        username: 'john',
        password: '123'
    },
    {
        username: 'ravan',
        password: '132'
    }
];

var FData = [];

function pvtIsValidUser(p_ClientData) {

    var LIsValidUser = false,
        LClientData = p_ClientData;

    FUsers.forEach((p_objRecord) => {

        if (p_objRecord.username === LClientData.username && p_objRecord.password === LClientData.password) {

            LIsValidUser = true;
            return false;
        }
    });

    return LIsValidUser;
}

wss.on('connection', ws => {

    console.log('Connection Successful');

    //Receiving data from Client
    ws.on('message', (data) => {

        var LClientData = JSON.parse(data),
            LMessages;

        if (pvtIsValidUser(LClientData) === false) {

            ws.send(JSON.stringify({ success: false, message: 'User is not valid' }));
            return;
        }

        ws.username = LClientData.username;

        if (LClientData.isFromLoginIn === true) {

            //Adding first user "toUsername" field
            LClientData.toUsername = FUsers[0].username;

            LMessages = pvtGetMessage(LClientData);
            ws.send(JSON.stringify({ success: true, isFromLoginIn: true, availableUsers: FUsers, messages: LMessages }));
            return;
        }//if..

        if (LClientData.userChange === true) {

            LMessages = pvtGetMessage(LClientData);

            ws.send(JSON.stringify({ success: true, messages: LMessages }));
            return;
        }//if..

        FData.push(LClientData);

        LMessages = pvtGetMessage(LClientData);

        wss.clients.forEach(function (p_objRecord) {
            if (p_objRecord.username === LClientData.toUsername) {

                p_objRecord.send(JSON.stringify({ success: true, messages: LMessages }));
            }
        })

        // ws.send(JSON.stringify({ success: true, messages: LMessages }));
    });

    //On connection closed
    ws.on('close', (code, reason) => {
        console.log('Connection Terminated');
    });

    function pvtGetMessage(p_ClientData) {

        // return FData.filter(function (p_objRecord) {

        //     if (p_objRecord.username === p_ClientData.username ||
        //         p_objRecord.toUsername === p_ClientData.username ||
        //         p_objRecord.username === p_ClientData.toUsername) {

        //         return true;
        //     }//if..

        //     return false;
        // });

        return FData.filter(function (p_objRecord) {

            if (//Messae sent from this user
                (p_objRecord.username === p_ClientData.toUsername && p_objRecord.toUsername === p_ClientData.username) ||
                //Message recieved from this user
                (p_objRecord.username === p_ClientData.username && p_objRecord.toUsername === p_ClientData.toUsername)
            ) {

                return true;
            }//if..

            return false;
        });
    }
});