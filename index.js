const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

const amqp = require('amqplib');

app.use(express.json());

// Connect to RabbitMQ server
const connectToRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://user:password@localhost:5672');
    const channel = await connection.createChannel();
    const queue = 'exampleQueue';


    // Set up the route to publish a message to RabbitMQ
    app.post('/publish', async (req, res) => {
      const message = req.body.message || 'Hello RabbitMQ!';

      // const queueName = req.body.queueName || 'queue0';

      await channel.assertQueue(req.body.queueName, { durable: false });

      channel.sendToQueue(queue, Buffer.from(message));
      res.send('Message sent to RabbitMQ');
    });

    // Set up the route to consume messages from RabbitMQ
    app.get('/consume', async (req, res) => {

      const response = await axios.get('http://user:password@localhost:15672/api/queues');


      response.data.forEach((queue) => {
        channel.consume(queue.name, (msg) => {
          if (msg) {
            console.log(`Received message: ${msg.content.toString()}`);
            channel.ack(msg);

            channel.deleteQueue(queue.name);

            res.send(`Received message`);

          } else {
            
          }
        });
      })
      // res.send('No messages in the queue');
      // ${msg.content.toString()}
      
    });

    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error.message);
  }
};

connectToRabbitMQ();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
