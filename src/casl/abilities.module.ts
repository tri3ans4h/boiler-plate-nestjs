import { Module } from '@nestjs/common';
import { AbilitiesFactory } from './abilities.factory';

@Module({
  controllers: [],
  providers: [AbilitiesFactory],
  exports: [AbilitiesFactory]
})
export class AbilitiesModule { }