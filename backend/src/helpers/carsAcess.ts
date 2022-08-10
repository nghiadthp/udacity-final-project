import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { CarItem } from '../models/CarItem'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('CarsAccess')

export class CarsAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly carsIndex = process.env.CARS_ID_INDEX,
        private readonly CarsTable = process.env.CAR_TABLE,
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION),
        private readonly s3 = new XAWS.S3({
            signatureVersion: 'v4'
        }),
    ) { }

    async getCarsByUserId(userId: string): Promise<CarItem[]> {
        logger.info('get car by user')
        const result = await this.docClient.query({
            TableName: this.CarsTable,
            IndexName: this.carsIndex,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            }
        }).promise()

        const items = result.Items
        logger.info(items)
        return items as CarItem[]
    }

    async createCar(carItem: CarItem): Promise<CarItem> {
        logger.info('create car', carItem.carId)
        const newItem = {
            ...carItem,
            attachmentUrl: `https://${this.bucketName}.s3.amazonaws.com/${carItem.carId}`
        }
        await this.docClient.put({
            TableName: this.CarsTable,
            Item: newItem
        }).promise()
        logger.info(newItem)
        return newItem
    }

    async updateCar(carItem: CarItem): Promise<void> {
        logger.info('update car', carItem.carId)
        const updateExpression = 'set #name = :name, #carMaker = :carMaker, #model = :model, #sellerEmail = :sellerEmail'
        const conditionExpression = 'carId = :carId'
        await this.docClient.update({
            TableName: this.CarsTable,
            Key: {
                carId: carItem.carId,
                userId: carItem.userId
            },
            UpdateExpression: updateExpression,
            ConditionExpression: conditionExpression,
            ExpressionAttributeNames: {
                '#name': 'name',
                '#carMaker': 'carMaker',
                '#model': 'model',
                '#sellerEmail': 'sellerEmail'
            },
            ExpressionAttributeValues: {
                ':name': carItem.name,
                ':carMaker': carItem.carMaker,
                ':model': carItem.model,
                ':sellerEmail': carItem.sellerEmail,
                ':carId': carItem.carId
            }
        }).promise()
        logger.info(carItem)
    }

    async getSignedUploadUrl(carId: string, userId: string): Promise<string> {
        logger.info('get preSignedUrl')
        const attachmentUrl = this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: carId,
            Expires: this.urlExpiration
        })
        logger.info(attachmentUrl)

        this.docClient.update(
            {
                TableName: this.CarsTable,
                Key: {
                    carId,
                    userId,
                },
                UpdateExpression: "set attachmentUrl = :attachmentUrl",
                ExpressionAttributeValues: {
                    ":attachmentUrl": `https://${this.bucketName}.s3.amazonaws.com/${carId}`,
                }
            }
        )
        return attachmentUrl

    }

    async deleteCar(carId: string, userId: string): Promise<void> {
        logger.info('delete car', carId)
        await this.docClient.delete({
            TableName: this.CarsTable,
            Key: {
                carId,
                userId
            },
            ConditionExpression: 'carId = :carId',
            ExpressionAttributeValues: {
                ':carId': carId
            }
        }).promise()

        const params = {
            Bucket: this.bucketName,
            Key: carId
        }
        
        await this.s3.deleteObject(params, function (err, data) {
            if (err) logger.info('error while deleting object', err.stack)
            else logger.info(data)
        }).promise()
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Create dynamo db')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}