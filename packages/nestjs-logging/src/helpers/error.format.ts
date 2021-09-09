import { 
    FastifyRequest as Request, 
    LightMyRequestResponse as Response
  } from 'fastify';

  /**
   * Function to format message from request
   * @param req 
   * @returns 
   */
 const formatRequestMessage = (req: Request): string  => {
    const { method, url } = req;
    const now = new Date();

    return `${now.toISOString()} ${method} ${url}`;
  }

  /**
   * Function to format message for response
   * @param req 
   * @param res 
   * @param startDate 
   * @param error 
   * @returns 
   */
const formatResponseMessage = (
    req: Request,
    res: Response,
    startDate: Date,
    error?: Error
  ): string => {
    const { method, url } = req;
    const now = new Date();

    return (
      `${now.toISOString()} ${method} ${url} ${res.statusCode} ` +
      `${now.getTime() - startDate.getTime()}ms` +
      (error ? ` - ${error}` : '')
    );
}

  export default {
    formatRequestMessage,
    formatResponseMessage
  };