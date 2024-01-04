import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { NotificationCode } from './http-status.enum';
import {ResultNotification} from "../utils/result-notification";
import {ApiErrorResultDto} from "../utils/api-error-result.dto";

export class CheckerNotificationErrors<T = null> extends Error {
  constructor(
    message: string,
    public resultNotification: ResultNotification<T>,
  ) {
    super(message);
  }
}

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (process.env.envoirment !== `production`) {
      response
        .status(500)
        .send({ error: exception.toString(), stack: exception.stack });
    } else {
      response.status(500).send(`some error occurred`);
    }
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const responseBody: any = exception.getResponse();

    const errorResult = new ApiErrorResultDto();
    errorResult.statusCode = status;
    if (status === 401) {
      errorResult.messages = [
        { message: 'Authorization error', field: 'authorization' },
      ];
      errorResult.error = 'Unauthorized';
      return response.status(status).json(errorResult);
    }
    errorResult.messages =
      status === 400 ? mapErrorsToNotification(responseBody.message) : [];
    errorResult.error = status === 400 ? 'Bad Request' : exception.message;
    return response.status(status).json(errorResult);
  }
}

@Catch(CheckerNotificationErrors)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: CheckerNotificationErrors, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const codeMap = {
      [NotificationCode.OK]: 200,
      [NotificationCode.NOT_FOUND]: 404,
      [NotificationCode.BAD_REQUEST]: 400,
      [NotificationCode.UNAUTHORIZED]: 401,
      [NotificationCode.FORBIDDEN]: 403,
      [NotificationCode.SERVER_ERROR]: 500,
    };
    const statusCode = codeMap[exception.resultNotification.getCode()] || 500;
    const errorResult = new ApiErrorResultDto();
    errorResult.statusCode = statusCode;
    errorResult.messages = mapErrorsToNotification(
      exception.resultNotification.extensions,
    );
    errorResult.error =
      NotificationCode[exception.resultNotification.getCode()];
    return response?.status(statusCode).json(errorResult);
  }
}

export function mapErrorsToNotification(errors: any[]) {
  if (!Array.isArray(errors)) {
    return errors;
  }
  const errorResponse = [];
  errors?.forEach((item: any) =>
    errorResponse.push({ message: item.message, field: item.field }),
  );
  return errorResponse;
}
