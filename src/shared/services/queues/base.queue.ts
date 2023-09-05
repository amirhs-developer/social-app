/* eslint-disable @typescript-eslint/no-unused-vars */
import Queue , { Job } from 'bull';
import Logger from 'bunyan';
import {createBullBoard,ExpressAdapter,BullAdapter } from '@bull-board/express';
import {config} from '@root/config';
import { IAuthJob } from '@auth/interfaces/auth.interface';

// import {createBullBoard} from '@bull-board/api';
// import {BullAdapter} from '@bull-board/api/bullAdapter';
// import  {ExpressAdapter} from '@bull-board/express';

// import { createBullBoard } from '@bull-board/api';
// import { BullAdapter } from '@bull-board/api/bullAdapter';
// import { ExpressAdapter } from '@bull-board/express';

type IBaseJobData =
  | IAuthJob;

let bullAdapters: BullAdapter[] = [];

export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue {
  queue: Queue.Queue;
  log: Logger;

  constructor(QueueName: string) {

    this.queue = new Queue(QueueName , `${config.REDIS_HOST}`);
    bullAdapters.push(new BullAdapter(this.queue)); // push queue in bullAdapter
    bullAdapters = [...new Set(bullAdapters)]; // remove duplicates

    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues'); // view on dashboard

    // create bull-board dashboard
    createBullBoard({
      queues: bullAdapters,
      serverAdapter: serverAdapter
    });

    this.log = config.createLogger(`${QueueName}Queue`);

    this.queue.on('completed' , (job: Job) => {
      job.remove();
    });

    this.queue.on('global:completed', (jobId: string) => {
      this.log.info(`job ${jobId} completed`);
    });

    this.queue.on('stalled', (jobId: string) => {
      this.log.info(`job ${jobId} stalled`);
    });
  }

  protected addJob(name: string , data: IBaseJobData): void {
    // add job in the queue
    this.queue.add(name , data , { attempts: 3, backoff: { type: 'fixed' , delay: 5000}});
  }

  protected processJob(name: string , concurrency: number , callback: Queue.ProcessCallbackFunction<void>): void {
    this.queue.process(name , concurrency , callback);
  }

}




