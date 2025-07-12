import amqp from 'amqplib'

let channel: amqp.Channel;


export const connectRabbitMQ = async () =>{
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: "localhost",
            port: 5672,
            username: "admin",
            password: "admin123"
        });

        channel = await connection.createChannel();
        console.log(`🚀 RabbitMQ connected`)
    } catch (error) {
        console.error(`❌ RabbitMQ connection failed. Error: ${error}`)
    }
}


export const publishToQueue = async (queueName:string, message:any)=>{
    if(!channel){
        console.log(`❌ RabbitMQ channel is not intailized`);
        return;
    }

    await channel.assertQueue(queueName, {durable:true});

    channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(message)),
        { 
            persistent: true,
        }
    )
}


export const invalidateChacheJob = async(cacheKeys:string[]) =>{
    try {
        const message = {
            action: "invalidateCache",
            key: cacheKeys
        };

        await publishToQueue("cache-invalidation", message)
        console.log(`✔ Cache invalidation job published means added to queue, to RabbitMQ.`)
    } catch (error) {
        console.error(`❌ Failed to en-queue/publist cache on RabbitMQ invalidateChacheJob(). Error: ${error}`)
    }
}

// this i will receive in blog service