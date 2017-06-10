function createChannel(channelName, consumeFn) {
    return function (err, ch) {
        var ex = channelName;

        ch.assertExchange(ex, 'fanout', { durable: false });

        ch.assertQueue('', { exclusive: true }, function (err, q) {
            ch.bindQueue(q.queue, ex, '');

            ch.consume(q.queue, consumeFn, { noAck: true });
        });
    };
};

module.exports = createChannel;