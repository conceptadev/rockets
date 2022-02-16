import { HttpException, HttpStatus } from "@nestjs/common";

export class RocketsException extends HttpException {
  public rocketsCode: string;
  constructor(code: string, exception: HttpException) {
    super(exception, exception.getStatus());
    this.rocketsCode = code;
  }

  // constructor(code: string, message: string, status: HttpStatus) {
  //   super(message, status);
  //   this.rocketsCode = code;
  // }
}