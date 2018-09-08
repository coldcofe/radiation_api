import { Controller, Get, Post, Body, Put, Param, Delete, HttpCode, Req, Request, Response, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import * as fs from 'fs';
import { ApiUseTags, ApiResponse } from '@nestjs/swagger';
import { ReportDto, ReportListReq, ReportDataDto, ReportListDto, SketchMapDto } from './reports.dto';
import { Roles } from '../grards/roles.grards';
import { UserInfo } from '../decorators/userinfo';
@ApiUseTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
  ) { }

  @Post('/upload')
  @Roles()
  @ApiResponse({ status: 201, type: ReportDto })
  async uploadReport(@UserInfo() userInfo, @Body() reportDto: ReportDto) {
    let report = await this.reportsService.createReport(userInfo.id, reportDto);
    return report;
  }

  @Put()
  @Roles()
  @ApiResponse({ status: 201, type: ReportDto })
  async updateReport(@Body() reportDto: ReportDto) {
    let report = await this.reportsService.updateReport(reportDto);
    reportDto.id = report.id;
    reportDto.measurePerson = report.measurePerson;
    reportDto.machineNO = report.machineNO;
    reportDto.taskNO = report.taskNO;
    reportDto.measuredAt = report.measuredAt;
    reportDto.type = report.type;
    reportDto.weather = report.weather;
    reportDto.address = report.address;
    reportDto.unit = report.unit;
    reportDto.contactPerson = report.contactPerson;
    reportDto.contactPersonTel = report.contactPersonTel;
    reportDto.GPS = report.GPS;
    reportDto.sketchMap = report.sketchMap;
    reportDto.result = report.result;
    reportDto.pictures = report.pictures ? JSON.parse(report.pictures) : [];
    reportDto.data = report.data ? report.data.map((item) => {
      let reportDataDto = new ReportDataDto();
      reportDataDto.id = item.id;
      reportDataDto.measurePoint = item.measurePoint;
      reportDataDto.K = item.K;
      reportDataDto.values = item.values;
      return reportDataDto;
    }) : [];
    return reportDto;
  }

  @Get('/list')
  @Roles()
  @ApiResponse({ status: 200, type: ReportListDto })
  async reportList(@UserInfo() userInfo, @Query() query: ReportListReq) {
    let { where, page, limit } = this.reportsService.reportQuery(userInfo, query);

    let reports = await this.reportsService.reportList(where, page, limit);
    let count = await this.reportsService.reportCount(where);
    let reportsDto = reports.map((report) => {
      let reportDto = new ReportDto();
      reportDto.id = report.id;
      reportDto.measurePerson = report.measurePerson;
      reportDto.machineNO = report.machineNO;
      reportDto.taskNO = report.taskNO;
      reportDto.measuredAt = report.measuredAt;
      reportDto.type = report.type;
      reportDto.weather = report.weather;
      reportDto.address = report.address;
      reportDto.unit = report.unit;
      reportDto.contactPerson = report.contactPerson;
      reportDto.contactPersonTel = report.contactPersonTel;
      reportDto.GPS = report.GPS;
      reportDto.sketchMap = report.sketchMap;
      reportDto.result = report.result;
      reportDto.pictures = report.pictures ? JSON.parse(report.pictures) : [];
      reportDto.data = report.data ? report.data.map((item) => {
        let reportDataDto = new ReportDataDto();
        reportDataDto.id = item.id;
        reportDataDto.measurePoint = item.measurePoint;
        reportDataDto.K = item.K;
        reportDataDto.values = item.values;
        return reportDataDto;
      }) : [];
      return reportDto;
    });
    return { reports: reportsDto, count };
  }

  @Get('/export/:id')
  // @Roles()
  @ApiResponse({ status: 200 })
  async reportExport(@Param('id') id, @Response() res) {
    res.writeHead(200, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-disposition': 'attachment; filename=out.docx',
    });
    let doc = await this.reportsService.reportExport(id);
    res.end(doc);
  }

  @Get('/sketchmap/list')
  @Roles('superadmin')
  @ApiResponse({ status: 201 })
  async sketchMapList() {
    let result = await this.reportsService.sketchMapList();
    return result;
  }

  @Post('/sketchmap')
  @Roles('superadmin')
  @ApiResponse({ status: 201 })
  async addSketchMap(@Body() sketchMapDto: SketchMapDto) {
    await this.reportsService.addSketchMap(sketchMapDto.pic);
  }

  @Delete('/sketchmap/:id')
  @Roles('superadmin')
  @ApiResponse({ status: 201 })
  async removeSketchMap(@Param('id') id) {
    await this.reportsService.removeSketchMap(parseInt(id, 10));
  }
}