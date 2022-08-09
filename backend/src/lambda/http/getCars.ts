import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getCarsByUserId as getCarsByUserId } from '../../businessLogic/cars'
import { getUserId } from '../utils';
const logger = createLogger('get-car')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('get cars')
    try {
      const userId = getUserId(event)
      // const jwtToken = getToken(event.headers.Authorization)
      const cars = await getCarsByUserId(userId)
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          items: cars
        })
      }
    } catch (e) {
      logger.error('Error: ' + e.message)
      return {
        statusCode: 500,
        body: e.message
      }
    }
  }
)
handler.use(
  cors({
    credentials: true
  })
)
