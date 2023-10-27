import { BadRequestException, INestApplication, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { QueryResponse, Querybuilder } from 'nestjs-prisma-querybuilder';
import { PrismaService } from '../prisma/prisma.service';
import { REQUEST } from '@nestjs/core';

import { Request } from 'express';
@Injectable()
export class QueryBuilderService {
  constructor(@Inject(REQUEST) private readonly request: Request, private readonly querybuilder: Querybuilder, private readonly prisma: PrismaService) {}

  /**
   *
   * @param model model name on schema.prisma;
   * @param primaryKey primaryKey name for this model on prisma.schema;
   * @param where object to 'where' using the prisma rules;
   * @param mergeWhere define if the previous where will be merged with the query where or replace that;
   * @param justPaginate remove any 'select' and 'include'
   * @param depth limit the the depth to filter/populate. default is '_5_'
   *
   */
  async query(model: Prisma.ModelName, primaryKey = 'id', where?: any, mergeWhere = false, justPaginate = false, depth?: number): Promise<Partial<QueryResponse>> {
    return this.querybuilder
      .query(primaryKey, depth)
      .then(async (query) => {
        if (where) query.where = mergeWhere ? { ...query.where, ...where } : where;

        const count = await this.prisma[model].count({ where: query.where });

        this.request.res.setHeader('count', count);

        if (justPaginate) {
          delete query.include;
          delete query.select;
        }

        return { ...query }
      })
      .catch((err) => {
        if (err.response?.message) throw new BadRequestException(err.response?.message);

        throw new BadRequestException('Internal error processing your query string, check your parameters');
      });
  }
}