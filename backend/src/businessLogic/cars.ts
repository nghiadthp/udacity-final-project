import { CarsAccess } from '../helpers/carsAcess'
import { CarItem } from '../models/CarItem'
import { CreateCarRequest } from '../requests/CreateCarRequest'
import { UpdateCarRequest } from '../requests/UpdateCarRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { parseUserId } from '../auth/utils'

const logger = createLogger('businessLogic_cars')
const carsAccess = new CarsAccess()

export async function getCarsByUserId(userId: string): Promise<CarItem[]> {
    logger.info('get cars by user id - ' + userId);
    return carsAccess.getCarsByUserId(userId)
}

export const getSignedUploadUrl = async (carId: string, userId: string): Promise<string> => {
    return carsAccess.getSignedUploadUrl(carId, userId)
}

export const createCar = async (createCarRequest: CreateCarRequest, jwtToken: string): Promise<CarItem> => {
    const userId = parseUserId(jwtToken)
    const carId = uuid.v4()
    const newItem = {
        userId,
        carId,
        name: createCarRequest.name,
        carMaker: createCarRequest.carMaker,
        model: createCarRequest.model,
        sellerEmail: createCarRequest.sellerEmail,
        description: createCarRequest.description
    }
    return await carsAccess.createCar(newItem)
}

export const updateCar = async (updateCarRequest: UpdateCarRequest, jwtToken: string, carId: string): Promise<void> => {
    const userId = parseUserId(jwtToken)
    const updatedItem = {
        userId,
        carId,
        name: updateCarRequest.name,
        carMaker: updateCarRequest.carMaker,
        model: updateCarRequest.model,
        sellerEmail: updateCarRequest.sellerEmail,
        description: updateCarRequest.description,
    }
    await carsAccess.updateCar(updatedItem)
}

export const deleteCar = async (carId: string, jwtToken: string): Promise<void> => {
    const userId = parseUserId(jwtToken)
    await carsAccess.deleteCar(carId, userId)
}


