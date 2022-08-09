import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateCar } from '../../businessLogic/cars'
import { UpdateCarRequest } from '../../requests/UpdateCarRequest'
import { createLogger } from '../../utils/logger'
import { getToken } from '../../auth/utils'
const logger = createLogger('update-car')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const carId = event.pathParameters.carId
      const updatedCar: UpdateCarRequest = JSON.parse(event.body)
      const jwtToken = getToken(event.headers.Authorization)
      await updateCar(updatedCar, jwtToken, carId)
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
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

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
