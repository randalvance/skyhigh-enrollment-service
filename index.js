var restify = require('restify');
var amqp = require('amqplib/callback_api');

function respond(req, res, next) {
    res.send('hello ' + req.params.name);
}

var server = restify.createServer();
server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});

amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel(function(err, ch) {
        var ex = 'subjects';

        ch.assertExchange(ex, 'fanout', {durable: false});

        ch.assertQueue('', { exclusive: true }, function(err, q) {
            console.log(' [*] Waiting for messages in %s. To exist press Ctrl + C', q.queue);

            ch.bindQueue(q.queue, ex, '');

            ch.consume(q.queue, function(msg) {
                console.log(' [x] %s', msg.content.toString());
            }, { noAck: true });
        });
    });
});