import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateCarRequest } from '../../requests/CreateCarRequest'
import { getToken } from '../../auth/utils'
import { createLogger } from "../../utils/logger";
import { createCar } from '../../businessLogic/cars'
const logger = createLogger("create-car");
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Start - Create car function')
    try {
      const newCar: CreateCarRequest = JSON.parse(event.body)
      const jwtToken = getToken(event.headers.Authorization)
      const newCreatedCar = await createCar(newCar, jwtToken)
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          item: newCreatedCar
        })
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

handler.use(
  cors({
    credentials: true
  })
)
