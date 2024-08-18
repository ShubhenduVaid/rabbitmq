#!/usr/bin/env node

var amqp = require("amqplib/callback_api");

amqp.connect("amqp://localhost", function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = "rpc_queue";

    channel.assertQueue(queue, {
      durable: false,
    });
    channel.prefetch(1);
    console.log(" [x] Awaiting RPC requests");
    channel.consume(queue, function reply(msg) {
      var n = parseInt(msg.content.toString());

      console.log(" [.] fib(%d)", n);

      var r = fibonacci(n);

      channel.sendToQueue(msg.properties.replyTo, Buffer.from(r.toString()), {
        correlationId: msg.properties.correlationId,
      });

      channel.ack(msg);
    });
  });
});

function fibonacci(n) {
  const memorize = {};

  function helper(n) {
    if (n in memorize) return memorize[n];
    if (n < 3) return 1;
    return (memorize[n] = helper(n - 1) + helper(n - 2));
  }

  return helper(n);
}
