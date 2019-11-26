import Bee from 'bee-queue';
import EnrollmentMail from '../app/jobs/EnrollmentMail';

const jobs = [EnrollmentMail];

class Queue{
    constructor() {
        this.queue = {};

        this.init();
    } 

    init() {
        jobs.forEach(({ key, handle})) => {
            this.queues[key] = new Bee(key,{
               redis: redisConfig,
            }),
            handle,
            };
        });    
    }

    add (queue, job) {
        return this.queunes[queue].bee.createJob(job).save();
    }

    bee.process(handle);
});
}
}

export default new Queue;