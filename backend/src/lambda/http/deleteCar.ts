import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getToken } from '../../auth/utils'
import { deleteCar } from '../../businessLogic/cars'
import { createLogger } from '../../utils/logger'
const logger = createLogger('delete-car')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('delete car by carId')
    try {
      const carId = event.pathParameters.carId
      const jwtToken = getToken(event.headers.Authorization)
      await deleteCar(carId, jwtToken)
      return {
        statusCode: 200,
        body: JSON.stringify(true)
      }
    } catch (e) {
      logger.error(e.message)
      return {
        statusCode: 500,
        body: e.message
      }
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
