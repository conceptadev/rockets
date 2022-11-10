import { Response } from 'express';
import { Readable } from 'stream';
import { Controller, Get, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { SwaggerUiService } from './swagger-ui.service';

@Controller('schema')
@ApiTags('schema')
export class SchemaController {
  constructor(private readonly swaggerUiService: SwaggerUiService) {}

  private static readonly JSON_V4 = 'json-v4';
  private static readonly OPEN_API_V3 = 'open-api-v3';

  @ApiOperation({
    summary: 'Download json schema v4',
  })
  @Get(SchemaController.JSON_V4)
  async downloadJsonSchema(@Res() res: Response) {
    const file = await this.swaggerUiService.getJsonSchema();
    this.sendFile(res, file, SchemaController.JSON_V4);
  }

  @ApiOperation({
    summary: 'Download open api v3',
  })
  @Get(SchemaController.OPEN_API_V3)
  async downloadOpenApi(@Res() res: Response) {
    const file = await this.swaggerUiService.getOpenApi();
    this.sendFile(res, file, SchemaController.OPEN_API_V3);
  }

  private sendFile(res: Response, file: Readable, fileName: string) {
    res.set(this.getCsvFileHeaders(fileName));

    file.pipe(res);
  }

  private getCsvFileHeaders(filename: string): {
    'Content-Disposition': string;
    'Content-Type': string;
  } {
    return {
      'Content-Type': 'text/json',
      'Content-Disposition': `attachment; filename="${filename}.csv"`,
    };
  }
}
