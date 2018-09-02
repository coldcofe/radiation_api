import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { User } from '../entity/user';
import { ReportData } from '../entity/report_data';
import { Report } from '../entity/report';
import { SketchMap } from '../entity/sketch_map';

@Module({
  imports: [TypeOrmModule.forFeature([User, Report, ReportData, SketchMap])],
  controllers: [ReportsController],
  providers: [
    ReportsService,
  ],
})
export class ReportsModule { }