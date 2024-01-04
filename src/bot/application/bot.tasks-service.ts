import { Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import {minskTimezone} from "../../utils/time-utils";

@Injectable()
export class BotTasksService {
  constructor(
    private readonly cronTaskRegister: SchedulerRegistry,
  ) {}
  // every 10 seconds 0/10 * * * * *
  // every minute * 0/1 * * *
  // every day on 11:00 => 0 0 11 * * *
  // every midnight 0 0 * * *

  // для рассылки. каждый день рассылает сообщения по активным розыгрышам
  // рассылает в 11 утра
  @Cron('0 11 * * *', { timeZone: minskTimezone })
  async sendEverydayBonusMessage(): Promise<void> {
    console.log('cron executed');
    this.getCrons();
  }

  // каждый день в 12 ночи будет проверять кто забрал ежедневный бонус
  // кто не забрал будет понижать серию до 5
  // также понижает ежедневную реферальную серию если не приглашать каждый день определенное количество рефералов
  // every minute 30 */1 * * *   -for testing
  // base 0 0 * * *
  @Cron('0 10 * * *', { timeZone: minskTimezone })
  async decreaseBonusSeries(): Promise<void> {
    console.log('decreaseBonusSeries executed');
  }

  createDynamicCronTask({
    executionDate,
    taskName,
    task,
  }: {
    executionDate: Date;
    taskName: string;
    task: () => Promise<void> | void;
  }): void {
    const newCronJob: CronJob = new CronJob(executionDate, task);

    this.cronTaskRegister.addCronJob(taskName, newCronJob);

    newCronJob.start();
  }

  deleteDynamicTask(taskName: string): void {
    try {
      this.cronTaskRegister.deleteCronJob(taskName);
    } catch (e) {
      console.log(
        `cant delete task with name: ${taskName} because task is not existed`,
      );
    }
  }

  // возвращает существующую задачу. если ее нет то вернет null
  getDynamicTask(taskName: string): CronJob | null {
    try {
      return this.cronTaskRegister.getCronJob(taskName);
    } catch (e) {
      return null;
    }
  }

  getCrons() {
    const jobs = this.cronTaskRegister.getCronJobs();
    jobs.forEach((value, key, map) => {
      let next;
      try {
        next = value.nextDates();
      } catch (e) {
        next = 'error: next fire date is in the past!';
      }
      console.log(`job: ${key} -> next: ${next}`);
    });
  }

}
