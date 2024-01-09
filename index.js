const express = require('express');
const app = express();
const port = 3000;

const amqp = require('amqplib');

// Connect to RabbitMQ server
const connectToRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://user:password@localhost:5672');
    const channel = await connection.createChannel();
    const queue = 'exampleQueue';

    // Ensure the queue exists

    await channel.assertQueue(queue, { durable: false });

    // Set up the route to publish a message to RabbitMQ
    app.post('/publish', async (req, res) => {
      const message = req.body.message || 'Hello RabbitMQ!';

      // const queueName = req.body.queueName || 'queue0';

      channel.sendToQueue(queue, Buffer.from(message));
      res.send('Message sent to RabbitMQ');
    });

    // Set up the route to consume messages from RabbitMQ
    app.get('/consume', async (req, res) => {

      channel.consume(queue, (msg) => {
        if (msg) {
          console.log(`Received message: ${msg.content.toString()}`);
          channel.ack(msg);

          

          channel.deleteQueue(queue);
          res.send(`Received message: ${msg.content.toString()}`);
        } else {
          res.send('No messages in the queue');
        }
      });
    });

    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error.message);
  }
};

connectToRabbitMQ();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
