import { INestApplication, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel> implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  constructor() {
    super({
      /*log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],*/
      //log: ['query', 'info'],
      //errorFormat: 'colorless',
    });
  }

  onModuleDestroy() {
    throw new Error('Method not implemented.');
  }
  async onModuleInit() {
    await this.$connect();
    /*
        this.$on('error', ({ message }) => {
          this.logger.error(message);
        });
        this.$on('warn', ({ message }) => {
          this.logger.warn(message);
        });
        this.$on('info', ({ message }) => {
          this.logger.debug(message);
        });
        this.$on('query', ({ query, params }) => {
          this.logger.log(`${query}; ${params}`);
        });*/
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async (event) => {
      await app.close();
    });
  }
}