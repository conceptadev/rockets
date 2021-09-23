import {
  FastifyRequest as Request,
  LightMyRequestResponse as Response,
} from 'fastify';

/**
 * Message formatting utility
 *
 * @private
 */
export class MessageFormatUtil {
  /**
   * Function to format message from request.
   *
   * @param req
   * @returns
   */
  static formatRequestMessage(req: Request): string {
    const { method, url } = req;
    const now = new Date();

    return `${now.toISOString()} ${method} ${url}`;
  }

  /**
   * Function to format message for response.
   *
   * @param req
   * @param res
   * @param startDate
   * @param error
   * @returns
   */
  static formatResponseMessage(
    req: Request,
    res: Response,
    startDate: Date,
    error?: Error,
  ): string {
    const { method, url } = req;
    const now = new Date();

    return (
      `${now.toISOString()} ${method} ${url} ${res.statusCode} ` +
      `${now.getTime() - startDate.getTime()}ms` +
      (error ? ` - ${error}` : '')
    );
  }
}
